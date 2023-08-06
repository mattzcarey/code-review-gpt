import { PromptFile, ReviewFile } from "../../../../common/types";
import { promptsIntoBatches } from "./utils/promptsIntoBatches";

export const fullFilesIntoBatches = async (
  files: ReviewFile[],
  maxBatchSize: number
): Promise<PromptFile[][]> => {
  const promptFiles = files.map((file) => ({
    fileName: file.fileName,
    promptContent: file.fileContent,
  }));

  return promptsIntoBatches(promptFiles, maxBatchSize);
};
