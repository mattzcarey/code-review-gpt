import {
  DiffRefsSchema,
  DiscussionNotePositionOptions,
  Gitlab,
} from "@gitbeaker/rest";

import parseGitPatch, {
  ParsedPatchModifiedLineType,
} from "../../../../node_modules/parse-git-patch/dist/src/index.js";
import { getGitLabEnvVariables } from "../../../config";
import { formatFeedback } from "../../../review/llm/generateMarkdownReport";
import { IFeedback } from "../../types";
import { logger } from "../../utils/logger";

const header = `---
diff --git a/oldName b/newName
index a 1
`;
const footer = `
--
`;
//TODO: refactor
interface ParsedPatch {
  old_path: string;
  new_path: string;
  lines: ParsedPatchModifiedLineType[] | undefined;
}
interface PreparedNote {
  botCommentBody: string;
  position: DiscussionNotePositionOptions;
}

function getApi() {
  const { gitlabToken, host } = getGitLabEnvVariables();

  return new Gitlab({
    token: gitlabToken,
    host,
  });
}

async function removeExistingBotComments(signOff: string): Promise<void> {
  const { projectId, mergeRequestIIdString } = getGitLabEnvVariables();

  const api = getApi();

  const discussions = await api.MergeRequestDiscussions.all(
    projectId,
    mergeRequestIIdString
  );

  const botNotesRemovals = discussions.reduce<Promise<void>[]>(
    (removals, discussion) => {
      discussion.notes
        ?.filter((note) => note.body.includes(signOff))
        .map((note) =>
          api.MergeRequestDiscussions.removeNote(
            projectId,
            mergeRequestIIdString,
            discussion.id,
            note.id
          )
        )
        .forEach((removal) => removals.push(removal));

      return removals;
    },
    []
  );

  await Promise.all(botNotesRemovals);
}

const prepareNote = (
  feedback: IFeedback,
  signOff: string,
  diff_refs: DiffRefsSchema,
  parsedDiffs: ParsedPatch[]
): PreparedNote | undefined => {
  const botCommentBody = `${formatFeedback(feedback)}\n\n${signOff}`;

  //Path in gitlab CI are formed like "/build/$GROUP_NAME/$PROJECT_NAME/the real path
  const realPathInGitlab = feedback.fileName.split("/").slice(4).join("/");

  const trimmedLine = feedback.line.trim();
  const feedbackLine =
    trimmedLine.startsWith("+") || trimmedLine.startsWith("-")
      ? trimmedLine.substring(1)
      : trimmedLine;

  const diff = parsedDiffs.find((diff) => diff.new_path === realPathInGitlab);

  //Try finding line in the patch including our feedback's line
  const patchedLine = diff?.lines?.find((line) =>
    line.line.includes(feedbackLine)
  );

  //if the above attempt was not successful, do vise versa - trying to find line from the patch that is included
  //into feedback (this criteria is worse). Also, use only at least 3 characters lines as lines like "};" are included into too many places
  const patchedLinePrio2 =
    patchedLine ??
    diff?.lines?.find(
      (line) =>
        line.line.trim().length > 3 && feedbackLine.includes(line.line.trim())
    );

  //For critical issue (reiskScore>5) no line information is available. So, we will use the first line from the patch
  //(Critical issues are those when GPT model was not able to answer at all)
  const finalLine =
    feedback.riskScore <= 5 ? patchedLinePrio2 : diff?.lines?.[0];

  //Skipping feedback given to one of the non changed lines
  if (!finalLine) {
    logger.error(
      `Can't find line ${feedback.line} in the file ${realPathInGitlab}. Skipping feedback: ${feedback.details} for ${feedback.fileName}`
    );

    return undefined;
  }

  const added = finalLine.added;

  //for some reason path parser adds 1 to the line number, so decrease it back
  const lineNumber = finalLine.lineNumber - 1;

  function getPosition(): DiscussionNotePositionOptions {
    return added
      ? {
          baseSha: diff_refs.base_sha,
          headSha: diff_refs.head_sha,
          startSha: diff_refs.start_sha,
          positionType: "text",
          newPath: realPathInGitlab,
          newLine: lineNumber.toString(10),
        }
      : {
          baseSha: diff_refs.base_sha,
          headSha: diff_refs.head_sha,
          startSha: diff_refs.start_sha,
          positionType: "text",
          oldPath: realPathInGitlab,
          oldLine: lineNumber.toString(10),
        };
  }

  const ret: PreparedNote = {
    botCommentBody,
    position: getPosition(),
  };

  return ret;
};

const createDiscussion = async (
  projectId: string,
  mergeRequestId: number,
  note: PreparedNote
) => {
  try {
    logger.debug(`Trying create a discussion for note ${JSON.stringify(note)}`);

    await getApi().MergeRequestDiscussions.create(
      projectId,
      mergeRequestId,
      note.botCommentBody,
      {
        position: note.position,
      }
    );

    logger.debug(
      `Succed to create discussion for: ${
        note.position.newPath || note.position.oldPath || ""
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      } ${note.position.newLine || note.position.oldLine}`
    );
  } catch (error) {
    logger.error(
      `Failed to create a discussion for: ${
        note.position.newPath || note.position.oldPath || ""
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      } ${note.position.newLine || note.position.oldLine}`
    );
    logger.error(error);
  }
};

/**
 * Publish a comment on the pull request. The comment will be signed off with the provided sign off.
 * @param comment The body of the comment to publish.
 * @param signOff The sign off to use. This also serves as key to check if the bot has already commented and update the comment instead of posting a new one if necessary.
 */
export const commentOnPR = async (
  feedbacks: IFeedback[],
  signOff: string
): Promise<void> => {
  try {
    await removeExistingBotComments(signOff);

    const api = getApi();

    const { projectId, mergeRequestIIdString } = getGitLabEnvVariables();

    const mergeRequestIId = parseInt(mergeRequestIIdString, 10);

    const { diff_refs } = await api.MergeRequests.show(
      projectId,
      mergeRequestIId
    );

    const diffs = await getApi().MergeRequests.allDiffs(
      projectId,
      mergeRequestIId
    );

    const parsedDiffs: ParsedPatch[] = diffs.map((diff) => {
      return {
        lines: parseGitPatch(header + diff.diff + footer)?.files[0]
          .modifiedLines,
        new_path: diff.new_path,
        old_path: diff.old_path,
      };
    });

    await Promise.all(
      feedbacks.reduce<Promise<void>[]>((feedbacks, feedback) => {
        const note = prepareNote(feedback, signOff, diff_refs, parsedDiffs);

        if (note) {
          feedbacks.push(createDiscussion(projectId, mergeRequestIId, note));
        }

        return feedbacks;
      }, [])
    );
  } catch (error) {
    logger.error(`Failed to comment on Gitlab MR:`, error);
    throw error;
  }
};
