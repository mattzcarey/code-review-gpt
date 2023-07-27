import { readFile } from "fs/promises";
import { makeSlimmedFile } from "../makeSlimmedFile";
import { instructionPrompt } from "../prompts";
import { ReviewFile } from "../types";

const getSizeOfReviewFile = (file: ReviewFile): number =>
  file.fileName.length + file.fileContent.length;

const splitFilesIntoBatches = async (
  files: ReviewFile[],
  maxBatchSize: number,
  isCi: boolean
): Promise<ReviewFile[][]> => {
  const batches: ReviewFile[][] = [];
  let currentBatch: ReviewFile[] = [];
  let currentBatchSize = 0;
  for (const file of files) {
    const currentFileSize = getSizeOfReviewFile(file);
    if (currentFileSize > maxBatchSize) {
      console.warn(
        `File ${file.fileName} is larger than the max prompt length, consider using a model with a larger context window. Attempting to slim the file...`
      );
      const slimmedFile = await makeSlimmedFile(file, maxBatchSize, isCi);
      currentBatch.push(slimmedFile);
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

const readFiles = async (fileNames: string[]): Promise<ReviewFile[]> => {
  const files: ReviewFile[] = [];

  for (const fileName of fileNames) {
    try {
      const fileContent = await readFile(fileName, "utf8");
      files.push({ fileName, fileContent });
    } catch (error) {
      console.error(`Failed to process file ${fileName}: ${error}`);
    }
  }

  return files;
};

export const constructPromptsArray = async (
  fileNames: string[],
  maxPromptLength: number,
  isCi: boolean
): Promise<string[]> => {
  const filesToReview = await readFiles(fileNames);

  const maxPromptPayloadLength = maxPromptLength - instructionPrompt.length;
  const promptPayloads = await splitFilesIntoBatches(
    filesToReview,
    maxPromptPayloadLength,
    isCi
  );

  const prompts = promptPayloads.map((payload) => {
    return instructionPrompt + JSON.stringify(payload);
  });

  return prompts;
};
