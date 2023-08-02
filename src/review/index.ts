import { getMaxPromptLength } from "../common/model/getMaxPromptLength";
import { commentOnPR as commentOnPRGithub } from "../common/ci/github/commentOnPR";
import { commentOnPR as commentOnPRGitlab } from "../common/ci/gitlab/commentOnPR";
import { commentPerFile } from "../common/ci/github/commentPerFile";
import { signOff } from "./constants";
import { askAI } from "./llm/askAI";
import { constructPromptsArray } from "./prompt/constructPrompt/constructPrompt";
import { File } from "../common/types";
import { filterFiles } from "./prompt/filterFiles";
import { ReviewArgs } from "../common/types";
import { GITHUB, GITLAB } from "../common/constants";

export const review = async (yargs: ReviewArgs, files: File[]) => {
  const isCi = yargs.ci;
  const shouldCommentPerFile = yargs.commentPerFile;

  const modelName = yargs.model as string;

  const filteredFiles = filterFiles(files);

  const maxPromptLength = getMaxPromptLength(modelName);

  const prompts = await constructPromptsArray(filteredFiles, maxPromptLength);

  const { markdownReport: response, feedbacks } = await askAI(
    prompts,
    modelName
  );

  if (isCi === GITHUB) {
    if (!shouldCommentPerFile) {
      await commentOnPRGithub(response, signOff);
    }
    if (shouldCommentPerFile) {
      await commentPerFile(feedbacks, signOff);
    }
  }
  if (isCi === GITLAB) {
    await commentOnPRGitlab(response, signOff);
  }
};
