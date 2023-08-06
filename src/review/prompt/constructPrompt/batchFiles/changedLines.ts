import { PromptFile, ReviewFile } from "../../../../common/types";
import { createPromptFiles } from "./utils/createPromptFiles";
import { promptsIntoBatches } from "./utils/promptsIntoBatches";

export const changedLinesIntoBatches = async (
  files: ReviewFile[],
  maxPromptPayloadLength: number
): Promise<PromptFile[][]> => {
  const promptFiles = createPromptFiles(files, maxPromptPayloadLength);
  return promptsIntoBatches(promptFiles, maxPromptPayloadLength);
};
