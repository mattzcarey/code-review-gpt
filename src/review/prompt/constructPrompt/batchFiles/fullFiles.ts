import { promptsIntoBatches } from "./utils/promptsIntoBatches";
import { PromptFile, ReviewFile } from "../../../../common/types";

export const fullFilesIntoBatches = async (
  files: ReviewFile[],
  maxBatchSize: number
): Promise<PromptFile[][]> => {
  const promptFiles = files.map((file) => ({
    fileName: file.fileName,
    promptContent: file.fileContent
      .split("\n")
      .map((line) => `+${line}`) //add a plus sign to each line to indicate that it is an added line
      .join("\n"),
  }));

  return promptsIntoBatches(promptFiles, maxBatchSize);
};
