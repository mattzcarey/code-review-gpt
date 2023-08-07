import { getMaxPromptLength } from "../common/model/getMaxPromptLength";
import { commentOnPR as commentOnPRGithub } from "../common/ci/github/commentOnPR";
import { commentOnPR as commentOnPRGitlab } from "../common/ci/gitlab/commentOnPR";
import { commentPerFile } from "../common/ci/github/commentPerFile";
import { signOff } from "./constants";
import { askAI } from "./llm/askAI";
import { constructPromptsArray } from "./prompt/constructPrompt/constructPrompt";
import { PlatformOptions } from "../common/types";
import { getReviewFiles } from "../common/utils/getReviewFiles";
import { filterFiles } from "./prompt/filterFiles";
import { ReviewArgs } from "../common/types";
import { logger } from "../common/utils/logger";

export const review = async (yargs: ReviewArgs) => {
  logger.debug(`Review started.`);
  logger.debug(`Model used: ${yargs.model}`);
  logger.debug(`Ci enabled: ${yargs.ci}`);
  logger.debug(`Remote Pull Request: ${yargs.remote}`);
  logger.debug(`Comment per file enabled: ${yargs.commentPerFile}`);

  const isCi = yargs.ci;
  const shouldCommentPerFile = yargs.commentPerFile;
  const modelName = yargs.model as string;
  const remotePullRequest = yargs.remote as string;

  const files = await getReviewFiles(isCi, remotePullRequest);
  const filteredFiles = filterFiles(files);
  const maxPromptLength = getMaxPromptLength(modelName);
  const prompts = await constructPromptsArray(filteredFiles, maxPromptLength);

  logger.debug(`Prompts used:\n ${prompts}`);

  const { markdownReport: response, feedbacks } = await askAI(
    prompts,
    modelName
  );

  logger.debug(`Markdown report:\n ${response}`);

  if (isCi === PlatformOptions.GITHUB) {
    if (!shouldCommentPerFile) {
      await commentOnPRGithub(response, signOff);
    }
    if (shouldCommentPerFile) {
      await commentPerFile(feedbacks, signOff);
    }
  }
  if (isCi === PlatformOptions.GITLAB) {
    await commentOnPRGitlab(response, signOff);
  }
};
