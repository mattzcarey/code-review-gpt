import { Gitlab } from "@gitbeaker/rest";

import { getGitLabEnvVariables } from "../../../config";
import { logger } from "../../utils/logger";
/**
 * Publish a comment on the pull request. If the bot has already commented (i.e. a comment with the same sign off exists), update the comment instead of creating a new one.
 * The comment will be signed off with the provided sign off.
 * @param comment The body of the comment to publish.
 * @param signOff The sign off to use. This also serves as key to check if the bot has already commented and update the comment instead of posting a new one if necessary.
 * @returns
 */
export const commentOnPR = async (
  comment: string,
  signOff: string
): Promise<void> => {
  try {
    const { gitlabToken, projectId, mergeRequestIIdString } =
      getGitLabEnvVariables();
    const mergeRequestIId = parseInt(mergeRequestIIdString, 10);
    const api = new Gitlab({
      token: gitlabToken,
    });

    const notes = await api.MergeRequestNotes.all(projectId, mergeRequestIId);

    const botComment = notes.find((note) => note.body.includes(signOff));

    const botCommentBody = `${comment}\n\n---\n\n${signOff}`;

    if (botComment) {
      await api.MergeRequestNotes.edit(
        projectId,
        mergeRequestIId,
        botComment.id,
        { body: botCommentBody }
      );
    } else {
      await api.MergeRequestNotes.create(
        projectId,
        mergeRequestIId,
        botCommentBody
      );
    }
  } catch (error) {
    logger.error(`Failed to comment on PR: ${JSON.stringify(error)}`);
    throw error;
  }
};
