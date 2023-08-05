import { PromptFile, ReviewFile } from "../../../../common/types";
import { createPromptFiles } from "./utils/createPromptChangedLines";
import { filesIntoBatches } from "./utils/filesIntoBatches";

export const costOptimizedChangedLinesIntoBatches = async (
  files: ReviewFile[],
  maxPromptPayloadLength: number
): Promise<PromptFile[][]> => {
  const MAX_SURROUNDING_LINES = 5;
  const promptFiles = createPromptFiles(
    files,
    maxPromptPayloadLength,
    MAX_SURROUNDING_LINES
  );
  return filesIntoBatches(promptFiles, maxPromptPayloadLength);
};
