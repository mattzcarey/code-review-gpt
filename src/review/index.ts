import { commentOnPR as commentOnPRAzdev } from '../common/ci/azdev/commentOnPR';
import { commentOnPR as commentOnPRGitHub } from '../common/ci/github/commentOnPR';
import { commentOnPR as commentOnPRGitLab } from '../common/ci/gitlab/commentOnPR';
import { createModel } from '../common/llm/models';
import { getMaxPromptLength } from '../common/llm/promptLength';
import { PlatformOptions, type ReviewArgs, type ReviewFile } from '../common/types';
import { logger } from '../common/utils/logger';
import { signOff } from './constants';
import { reviewPipeline } from './pipeline';
import { constructPromptsArray } from './prompt';
import { filterFiles } from './utils/filterFiles';

export const review = async (yargs: ReviewArgs, files: ReviewFile[]): Promise<void> => {
  logger.debug('Review started.');
  logger.debug(`Model used: ${yargs.modelString}`);
  logger.debug(`Ci enabled: ${yargs.ci ?? 'ci is undefined'}`);
  logger.debug(`Review type: ${yargs.reviewType}`);
  logger.debug(`Review language: ${yargs.reviewLanguage}`);
  logger.debug(`Review mode: ${yargs.reviewMode}`);
  logger.debug(`Remote Pull Request: ${yargs.remote ?? 'remote pull request is undefined'}`);

  const isCi = yargs.ci;
  const reviewType = yargs.reviewType;
  const reviewLanguage = yargs.reviewLanguage;
  const modelString = yargs.modelString;

  const filteredFiles = filterFiles(files);

  if (filteredFiles.length === 0) {
    logger.info('No file to review, finishing review now.');

    return undefined;
  }

  logger.debug(
    `Files to review after filtering: ${filteredFiles.map((file) => file.fileName).toString()}`
  );

  const maxPromptLength = getMaxPromptLength(modelString);
  const model = createModel(modelString);

  const prompts = constructPromptsArray(filteredFiles, maxPromptLength, reviewType, reviewLanguage);

  const { markdownReport: response, feedbacks } = await reviewPipeline(prompts, model);

  if (isCi === PlatformOptions.GITHUB) {
    await commentOnPRGitHub(response, signOff);
  }
  if (isCi === PlatformOptions.GITLAB) {
    await commentOnPRGitLab(response, signOff);
  }
  if (isCi === PlatformOptions.AZDEV) {
    await commentOnPRAzdev(response, signOff);
  }

  logger.info(`Markdown report:\n${response}`);
};
