import { instructionPrompt } from "../constants";
import { readFile } from "fs/promises";

interface ReviewFile {
  fileName: string;
  fileContent: string;
}

const getSizeOfReviewFile = (file: ReviewFile): number =>
  file.fileName.length + file.fileContent.length;

const splitFilesIntoBatches = (
  files: ReviewFile[],
  maxBatchSize: number
): ReviewFile[][] =>
  files.reduce(
    (batches: ReviewFile[][], currentFile: ReviewFile): ReviewFile[][] => {
      if (batches.length === 0) {
        batches.push([currentFile]);
      } else {
        const lastBatch = batches[batches.length - 1];

        const currentBatchSize = lastBatch.reduce(
          (totalSize: number, file: ReviewFile) =>
            totalSize + getSizeOfReviewFile(file),
          0
        );

        const currentFileSize = getSizeOfReviewFile(currentFile);

        if (currentBatchSize + currentFileSize > maxBatchSize) {
          batches.push([currentFile]);
        }

        lastBatch.push(currentFile);
      }

      return batches;
    },
    [[]] as ReviewFile[][]
  );

const splitFileContentsIntoChunks = (
  fileContents: string,
  maxChunkSize: number
): string[] => {
  const chunks = [];
  for (let i = 0; i < fileContents.length; i += maxChunkSize) {
    chunks.push(fileContents.slice(i, i + maxChunkSize));
  }
  return chunks;
};

export const constructPromptsArray = async (
  fileNames: string[],
  maxPromptLength: number
): Promise<string[]> => {
  const filesToReview = await Promise.all(
    fileNames.map(async (fileName: string): Promise<ReviewFile> => {
      try {
        const fileContent = await readFile(fileName, "utf8");
        return {
          fileName,
          fileContent,
        };
      } catch (error) {
        console.error(`Failed to process file ${fileName}:`, error);
        throw error;
      }
    })
  );

  const maxPromptPayloadLength = maxPromptLength - instructionPrompt.length;
  const promptPayloads = splitFilesIntoBatches(
    filesToReview,
    maxPromptPayloadLength
  );

  const prompts = promptPayloads.map((payload) => {
    return instructionPrompt + JSON.stringify(payload);
  });

  return prompts;
};
