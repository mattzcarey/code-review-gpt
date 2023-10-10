/* eslint-disable complexity */
import { signOff } from "./constants";
import { askAI } from "./llm/askAI";
import { generateMarkdownReport } from "./llm/generateMarkdownReport";
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

  //TODO: get rid of the summary at all
  const { summary, feedbacks } = await askAI(
    { files: filteredFiles, maxPromptLength, reviewType },
    modelName,
    openAIApiKey,
    organization,
    provider,
    //skip generating summary when we do not plan to use it
    //summary does not get used with GitLab and does not get used with GitHub in shouldCommentPerFile mode
    (isCi === PlatformOptions.GITHUB && shouldCommentPerFile) ||
      isCi === PlatformOptions.GITLAB
  );

  const response = generateMarkdownReport(modelName, feedbacks, summary);

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
    await commentOnPRGitlab(feedbacks, signOff);
  }

  return response;
};
