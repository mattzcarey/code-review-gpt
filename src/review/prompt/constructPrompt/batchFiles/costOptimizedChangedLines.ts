import { PromptFile, ReviewFile } from "../../../../common/types";
import { createPromptFiles } from "./utils/createPromptFiles";
import { promptsIntoBatches } from "./utils/promptsIntoBatches";

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
  return promptsIntoBatches(promptFiles, maxPromptPayloadLength);
};
