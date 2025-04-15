import { commentOnPR as commentOnPRAzdev } from '../common/ci/azdev/commentOnPR';
import { commentOnPR as commentOnPRGitHub } from '../common/ci/github/commentOnPR';
import { commentPerFile } from '../common/ci/github/commentPerFile';
import { commentOnPR as commentOnPRGitLab } from '../common/ci/gitlab/commentOnPR';
import { getMaxPromptLength } from '../common/model/promptLength';
import { PlatformOptions, type ReviewArgs, type ReviewFile } from '../common/types';
import { logger } from '../common/utils/logger';
import { signOff } from './constants';
import { reviewPipeline } from './pipeline';
import { constructPromptsArray } from './prompt';
import { filterFiles } from './utils/filterFiles';
import * as fs from 'fs';

export const review = async (
  yargs: ReviewArgs,
  files: ReviewFile[],
  openAIApiKey: string
): Promise<string | undefined> => {
  logger.debug('Review started.');
  logger.debug(`Model used: ${yargs.model}`);
  logger.debug(`Ci enabled: ${yargs.ci ?? 'ci is undefined'}`);
  logger.debug(`Comment per file enabled: ${String(yargs.commentPerFile)}`);
  logger.debug(`Review type chosen: ${yargs.reviewType}`);
  logger.debug(`Organization chosen: ${yargs.org ?? 'organization is undefined'}`);
  logger.debug(`Remote Pull Request: ${yargs.remote ?? 'remote pull request is undefined'}`);

  const isCi = yargs.ci;
  const shouldCommentPerFile = yargs.commentPerFile;
  const modelName = yargs.model;
  const reviewType = yargs.reviewType;
  const organization = yargs.org;
  const provider = yargs.provider;
  const reviewLanguage = yargs.reviewLanguage;

  const filteredFiles = filterFiles(files);

  if (filteredFiles.length === 0) {
    logger.info('No file to review, finishing review now.');

    return undefined;
  }

  logger.debug(
    `Files to review after filtering: ${filteredFiles.map((file) => file.fileName).toString()}`
  );

  const maxPromptLength = getMaxPromptLength(modelName);

  const prompts = constructPromptsArray(filteredFiles, maxPromptLength, reviewType, reviewLanguage);

  const { markdownReport: response, feedbacks } = await reviewPipeline(
    prompts,
    modelName,
    openAIApiKey,
    organization,
    provider
  );

  logger.debug(`Markdown report:\n${response}`);

  // Save review_result in GitHub Actions output
  if (process.env.GITHUB_OUTPUT) {
    logger.debug(`Save to review_result in GITHUB_OUTPUT`);
    try {
      fs.appendFileSync(process.env.GITHUB_OUTPUT, `review_result<<EOF\n${response}\nEOF\n`);
      logger.debug('Review result saved to GitHub Actions output');
    } catch (error) {
      logger.error('Failed to save review result to GitHub Actions output:', error);
    }
  }

  if (isCi === PlatformOptions.GITHUB) {
    if (!shouldCommentPerFile) {
      await commentOnPRGitHub(response, signOff);
    }
    if (shouldCommentPerFile) {
      await commentPerFile(feedbacks, signOff);
    }
  }
  if (isCi === PlatformOptions.GITLAB) {
    await commentOnPRGitLab(response, signOff);
  }

  if (isCi === PlatformOptions.AZDEV) {
    await commentOnPRAzdev(response, signOff);
  }

  return response;
};
