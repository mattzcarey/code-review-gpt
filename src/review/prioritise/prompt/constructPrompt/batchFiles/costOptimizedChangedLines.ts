import { createPromptFiles } from "./utils/createPromptFiles";
import { promptsIntoBatches } from "./utils/promptsIntoBatches";
import { type PromptFile, type ReviewFile } from "../../../../../common/types";
import { MAX_SURROUNDING_LINES } from "../../../../constants";

export const costOptimizedChangedLinesIntoBatches = (
  files: ReviewFile[],
  maxPromptPayloadLength: number
): PromptFile[][] => {
  const promptFiles = createPromptFiles(
    files,
    maxPromptPayloadLength,
    MAX_SURROUNDING_LINES
  );

  return promptsIntoBatches(promptFiles, maxPromptPayloadLength);
};
