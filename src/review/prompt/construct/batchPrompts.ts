import type { PromptFile } from '../../../common/types';
import { logger } from '../../../common/utils/logger';

// Define the return type for batchPrompts
export type BatchPromptsResult = {
  batches: PromptFile[][];
  skippedFiles: PromptFile[];
};

const getLengthOfFile = (file: PromptFile): number =>
  file.fileName.length + file.promptContent.length;

// Hardcoded limit for prompt batch size to ensure safety margin
const SAFE_PROMPT_BATCH_SIZE = 60000;

export const batchPrompts = (promptFiles: PromptFile[]): BatchPromptsResult => {
  const batches: PromptFile[][] = [];
  const skippedFiles: PromptFile[] = [];
  let currentBatch: PromptFile[] = [];
  let currentBatchSize = 0;

  for (const file of promptFiles) {
    const currentFileSize = getLengthOfFile(file);
    if (currentFileSize > SAFE_PROMPT_BATCH_SIZE) {
      logger.error(
        `Changes to file ${file.fileName} are larger than the safe prompt limit (${currentFileSize} > ${SAFE_PROMPT_BATCH_SIZE}), consider refactoring or splitting the file. Skipping file changes...`
      );
      skippedFiles.push(file); // Add the file to skippedFiles
    } else if (currentBatchSize + currentFileSize > SAFE_PROMPT_BATCH_SIZE) {
      batches.push(currentBatch);
      currentBatch = [file];
      currentBatchSize = currentFileSize;
    } else {
      currentBatch.push(file);
      currentBatchSize += currentFileSize;
    }
  }

  // Add the last batch to the result
  if (currentBatch.length > 0) {
    batches.push(currentBatch);
  }

  return { batches, skippedFiles }; // Return both batches and skipped files
};
