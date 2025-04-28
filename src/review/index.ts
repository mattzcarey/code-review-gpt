import { getFilesWithChanges } from '../common/git/getFilesWithChanges';
import { createModel } from '../common/llm/models';
import { getPlatformProvider } from '../common/platform/factory';
import type { ReviewArgs, ReviewFile } from '../common/types';
import { logger } from '../common/utils/logger';
import { runAgenticReview } from './agent';
import { constructPrompt } from './prompt';
import { filterFiles } from './utils/filterFiles';

export const review = async (yargs: ReviewArgs): Promise<void> => {
  logger.debug('Review started.');
  logger.debug(`Model used: ${yargs.modelString}`);
  logger.debug(`Review language: ${yargs.reviewLanguage}`);
  logger.debug(`Platform: ${yargs.platform}`);
  logger.debug(`Max steps: ${yargs.maxSteps}`);

  const files: ReviewFile[] = await getFilesWithChanges(yargs.platform);
  logger.debug(`Found ${files.length} changed files.`);
  const filteredFiles = filterFiles(files);
  logger.debug(`Filtered ${filteredFiles.length} files to review.`);

  if (filteredFiles.length === 0) {
    logger.info('No file to review, finishing review now.');
    return;
  }
  logger.debug(`Files to review after filtering: ${filteredFiles.map((file) => file.fileName)}`);

  const platformProvider = await getPlatformProvider(yargs.platform);
  logger.debug('Platform provider:', platformProvider);

  try {
    const model = createModel(yargs.modelString);
    const prompt = await constructPrompt(filteredFiles, yargs.reviewLanguage);
    logger.debug('Prompt:', prompt);

    const { success, message } = await runAgenticReview(
      prompt,
      model,
      platformProvider,
      yargs.maxSteps
    );
    if (success) {
      logger.info('Review completed successfully.');
    } else {
      logger.error('Review failed with message:', message);
      process.exit(1);
    }
  } catch (error: unknown) {
    logger.error('An error occurred during the review process:', JSON.stringify(error, null, 6));
    if (error instanceof Error && error.stack) {
      logger.debug(`Stack trace: ${error.stack}`);
    } else {
      logger.debug('No stack trace available for the error.');
    }
    process.exit(1);
  }
};
