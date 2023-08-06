import { commentOnPR as commentOnPRGithub } from "../common/ci/github/commentOnPR";
import { commentPerFile } from "../common/ci/github/commentPerFile";
import { commentOnPR as commentOnPRGitlab } from "../common/ci/gitlab/commentOnPR";
import { getMaxPromptLength } from "../common/model/getMaxPromptLength";
import { PlatformOptions, ReviewArgs, ReviewFile } from "../common/types";
import { logger } from "../common/utils/logger";
import { signOff } from "./constants";
import { askAI } from "./llm/askAI";
import { constructPromptsArray } from "./prompt/constructPrompt/constructPrompt";
import { filterFiles } from "./prompt/filterFiles";

export const review = async (yargs: ReviewArgs, files: ReviewFile[]) => {
  logger.debug(`Review started.`);
  logger.debug(`Model used: ${yargs.model}`);
  logger.debug(`Ci enabled: ${yargs.ci}`);
  logger.debug(`Comment per file enabled: ${yargs.commentPerFile}`);
  logger.debug(`Review type chosen: ${yargs.reviewType}`);

  const isCi = yargs.ci;
  const shouldCommentPerFile = yargs.commentPerFile;
  const modelName = yargs.model;
  const reviewType = yargs.reviewType;

  const filteredFiles = filterFiles(files);
  logger.debug(
    `Files to review after filtering: ${filteredFiles.map(
      (file) => file.fileName
    )}`
  );

  const maxPromptLength = getMaxPromptLength(modelName);

  const prompts = await constructPromptsArray(
    filteredFiles,
    maxPromptLength,
    reviewType
  );

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
