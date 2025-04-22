import { commentOnPR as commentOnPRAzdev } from '../common/ci/azdev/commentOnPR';
import { commentOnPR as commentOnPRGitHub } from '../common/ci/github/commentOnPR';
import { commentOnPR as commentOnPRGitLab } from '../common/ci/gitlab/commentOnPR';
import { createModel } from '../common/llm/models';
import { getMaxPromptLength } from '../common/llm/promptLength';
import { PlatformOptions, type ReviewArgs } from '../common/types';
import { getReviewFiles } from '../common/utils/getReviewFiles';
import { logger } from '../common/utils/logger';
import { signOff } from './constants';
import { reviewPipeline } from './pipeline';
import { constructPromptsArray } from './prompt';
import { filterFiles } from './utils/filterFiles';
import * as fs from 'fs';

export const review = async (yargs: ReviewArgs): Promise<void> => {
  logger.debug('Review started.');
  logger.debug(`Model used: ${yargs.modelString}`);
  logger.debug(`Ci enabled: ${yargs.ci ?? 'ci is undefined'}`);
  logger.debug(`Review type: ${yargs.reviewType}`);
  logger.debug(`Review language: ${yargs.reviewLanguage}`);
  logger.debug(`Diff context: ${yargs.diffContext}`);
  logger.debug(`Review mode: ${yargs.reviewMode}`);
  logger.debug(`Remote Pull Request: ${yargs.remote ?? 'remote pull request is undefined'}`);

  const isCi = yargs.ci;
  const reviewType = yargs.reviewType;
  const reviewLanguage = yargs.reviewLanguage;
  const modelString = yargs.modelString;
  const diffContext = yargs.diffContext;
  const remote = yargs.remote;

  const files = await getReviewFiles(isCi, remote, diffContext);
  logger.debug(`Found ${files.length} files to review.`);
  const filteredFiles = filterFiles(files);
  logger.debug(`Filtered ${filteredFiles.length} files to review.`);

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

  const { markdownReport: response, jiraReport: jiraResponse, feedbacks } = await reviewPipeline(prompts, model);

  // Save review_result in GitHub Actions output
  if (process.env.GITHUB_OUTPUT) {
    logger.debug(`Save to review_result in GITHUB_OUTPUT`);
    try {
      fs.appendFileSync(process.env.GITHUB_OUTPUT, `review_result<<EOF\n${response}\nEOF\n`);
      fs.appendFileSync(process.env.GITHUB_OUTPUT, `jira_result<<EOF\n${jiraResponse}\nEOF\n`);
      logger.debug('Review result saved to GitHub Actions output');
    } catch (error) {
      logger.error('Failed to save review result to GitHub Actions output:', error);
    }
  }

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
  logger.info(`Jira report:\n${jiraResponse}`);
};
