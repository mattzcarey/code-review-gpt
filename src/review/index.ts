import { signOff } from "./constants";
import { askAI } from "./llm/askAI";
import { constructPromptsArray } from "./prompt/constructPrompt/constructPrompt";
import { filterFiles } from "./prompt/filterFiles";
import { commentOnPR as commentOnPRGithub } from "../common/ci/github/commentOnPR";
import { commentPerFile } from "../common/ci/github/commentPerFile";
import { commentOnPR as commentOnPRGitlab } from "../common/ci/gitlab/commentOnPR";
import { getMaxPromptLength } from "../common/model/getMaxPromptLength";
import { PlatformOptions, ReviewArgs, ReviewFile } from "../common/types";
import { logger } from "../common/utils/logger";

export const review = async (
  yargs: ReviewArgs,
  files: ReviewFile[],
  openAIApiKey: string
): Promise<string | undefined> => {
  logger.debug(`Review started.`);
  logger.debug(`Model used: ${yargs.model}`);
  logger.debug(`Ci enabled: ${yargs.ci as unknown as string}`);
  logger.debug(
    `Comment per file enabled: ${yargs.commentPerFile as unknown as string}`
  );
  logger.debug(`Review type chosen: ${yargs.reviewType}`);
  logger.debug(`Organization chosen: ${yargs.org as unknown as string}`);
  logger.debug(`Remote Pull Request: ${yargs.remote as unknown as string}`);

  const platform = yargs.ci;
  const shouldCommentPerFile = yargs.commentPerFile;
  const modelName = yargs.model;
  const reviewType = yargs.reviewType;
  const organization = yargs.org;

  const filteredFiles = filterFiles(files);

  if (filteredFiles.length === 0) {
    logger.info("No file to review, finishing review now.");

    return undefined;
  }

  logger.debug(
    `Files to review after filtering: ${
      filteredFiles.map((file) => file.fileName) as unknown as string
    }`
  );

  const maxPromptLength = getMaxPromptLength(modelName);

  const prompts = constructPromptsArray(
    filteredFiles,
    maxPromptLength,
    reviewType
  );

  logger.debug(`Prompts used:\n ${prompts as unknown as string}`);

  const { markdownReport: response, feedbacks } = await askAI(
    prompts,
    modelName,
    openAIApiKey,
    organization
  );

  logger.debug(`Markdown report:\n ${response}`);

  if (platform === PlatformOptions.GITHUB) {
    if (!shouldCommentPerFile) {
      await commentOnPRGithub(response, signOff);
    }
    if (shouldCommentPerFile) {
      await commentPerFile(feedbacks, signOff);
    }
  }
  if (platform === PlatformOptions.GITLAB) {
    await commentOnPRGitlab(response, signOff);
  }

  return response;
};
