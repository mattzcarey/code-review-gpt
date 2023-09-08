import { PromptFile } from "../../../../../common/types";
import { logger } from "../../../../../common/utils/logger";
import { getLengthOfFile } from "../../getLengthOfFile";

export const promptsIntoBatches = (
  promptFiles: PromptFile[],
  maxBatchSize: number
): PromptFile[][] => {
  const batches: PromptFile[][] = [];
  let currentBatch: PromptFile[] = [];
  let currentBatchSize = 0;

  for (const file of promptFiles) {
    const currentFileSize = getLengthOfFile(file);
    if (currentFileSize > maxBatchSize) {
      logger.error(
        `Changes to file ${file.fileName} are larger than the max prompt length, consider using a model with a larger context window. Skipping file changes...`
      );
      continue;
    } else if (currentBatchSize + currentFileSize > maxBatchSize) {
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

  return batches;
};
