import { PromptFile, ReviewFile } from "../../../../common/types";
import { createPromptFiles } from "./utils/createPromptChangedLines";
import { filesIntoBatches } from "./utils/filesIntoBatches";

export const changedLinesIntoBatches = async (
  files: ReviewFile[],
  maxPromptPayloadLength: number
): Promise<PromptFile[][]> => {
  const promptFiles = createPromptFiles(files, maxPromptPayloadLength);
  return filesIntoBatches(promptFiles, maxPromptPayloadLength);
};
