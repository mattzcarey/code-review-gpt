/* eslint-disable complexity */
import { commentOnPR as commentOnPRGithub } from "../common/ci/github/commentOnPR";
import { commentPerFile } from "../common/ci/github/commentPerFile";
import { commentOnPR as commentOnPRGitlab } from "../common/ci/gitlab/commentOnPR";
import { commentOnPR as commentOnPRAzdev } from "../common/ci/azdev/commentOnPR";
import { getMaxPromptLength } from "../common/model/getMaxPromptLength";
import { PlatformOptions, ReviewArgs, ReviewFile } from "../common/types";
import { logger } from "../common/utils/logger";
import { signOff } from "./constants";
import { askAI } from "./llm/askAI";
import { constructPromptsArray } from "./prompt/constructPrompt/constructPrompt";
import { filterFiles } from "./prompt/filterFiles";

export const review = async (
  yargs: ReviewArgs,
  files: ReviewFile[],
  openAIApiKey: string
): Promise<string | undefined> => {
  logger.debug(`Review started.`);
  logger.debug(`Model used: ${yargs.model}`);
  logger.debug(`Ci enabled: ${yargs.ci ?? "ci is undefined"}`);
  logger.debug(`Comment per file enabled: ${String(yargs.commentPerFile)}`);
  logger.debug(`Review type chosen: ${yargs.reviewType}`);
  logger.debug(
    `Organization chosen: ${yargs.org ?? "organization is undefined"}`
  );
  logger.debug(
    `Remote Pull Request: ${yargs.remote ?? "remote pull request is undefined"}`
  );

  const isCi = yargs.ci;
  const shouldCommentPerFile = yargs.commentPerFile;
  const modelName = yargs.model;
  const reviewType = yargs.reviewType;
  const organization = yargs.org;
  const provider = yargs.provider;

  const filteredFiles = filterFiles(files);

  if (filteredFiles.length === 0) {
    logger.info("No file to review, finishing review now.");

    return undefined;
  }

  logger.debug(
    `Files to review after filtering: ${filteredFiles
      .map((file) => file.fileName)
      .toString()}`
  );

  const maxPromptLength = getMaxPromptLength(modelName);

  const prompts = constructPromptsArray(
    filteredFiles,
    maxPromptLength,
    reviewType
  );

  logger.debug(`Prompts used:\n ${prompts.toString()}`);

  const { markdownReport: response, feedbacks } = await askAI(
    prompts,
    modelName,
    openAIApiKey,
    organization,
    provider
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

  if (isCi === PlatformOptions.AZDEV) {
    await commentOnPRAzdev(response, signOff);
  }

  return response;
};
