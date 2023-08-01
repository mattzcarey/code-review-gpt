import { makeSlimmedFile } from "../makeSlimmedFile";
import { instructionPrompt } from "../prompts";
import { File } from "../../../common/types";
import { ReviewFile } from "../types";
import { logger } from "../../../common/utils/logger";

const getSizeOfReviewFile = (file: ReviewFile): number =>
  file.fileName.length + file.fileContent.length;

const splitFilesIntoBatches = async (
  files: File[],
  maxBatchSize: number
): Promise<ReviewFile[][]> => {
  const batches: ReviewFile[][] = [];
  let currentBatch: ReviewFile[] = [];
  let currentBatchSize = 0;
  for (const file of files) {
    const currentFileSize = getSizeOfReviewFile(file);
    if (currentFileSize > maxBatchSize) {
      logger.warn(
        `File ${file.fileName} is larger than the max prompt length, consider using a model with a larger context window. Attempting to slim the file...`
      );
      const slimmedFile = await makeSlimmedFile(file, maxBatchSize);

      logger.debug(`Slimmed file: ${JSON.stringify(slimmedFile)}`);

      currentBatch.push(slimmedFile);
    } else if (currentBatchSize + currentFileSize > maxBatchSize) {
      batches.push(currentBatch);
      currentBatch = [
        {
          fileName: file.fileName,
          fileContent: file.fileContent,
        },
      ];
      currentBatchSize = currentFileSize;
    } else {
      currentBatch.push({
        fileName: file.fileName,
        fileContent: file.fileContent,
      });
      currentBatchSize += currentFileSize;
    }
  }

  // Add the last batch to the result
  if (currentBatch.length > 0) {
    batches.push(currentBatch);
  }

  return batches;
};

export const constructPromptsArray = async (
  files: File[],
  maxPromptLength: number
): Promise<string[]> => {
  const maxPromptPayloadLength = maxPromptLength - instructionPrompt.length;
  const promptPayloads = await splitFilesIntoBatches(
    files,
    maxPromptPayloadLength
  );

  const prompts = promptPayloads.map((payload) => {
    return instructionPrompt + JSON.stringify(payload);
  });

  return prompts;
};
