import { PromptFile, ReviewFile } from "../../../../common/types";
import { filesIntoBatches } from "./utils/filesIntoBatches";

export const fullFilesIntoBatches = async (
  files: ReviewFile[],
  maxBatchSize: number
): Promise<PromptFile[][]> => {
  const promptFiles = files.map((file) => ({
    fileName: file.fileName,
    promptContent: file.fileContent,
  }));

  return filesIntoBatches(promptFiles, maxBatchSize);
};
