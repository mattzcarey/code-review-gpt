import type { PromptFile, ReviewFile } from '../../../../common/types';
import { createPromptFiles } from './utils/createPromptFiles';
import { promptsIntoBatches } from './utils/promptsIntoBatches';

export const changedLinesIntoBatches = (
  files: ReviewFile[],
  maxPromptPayloadLength: number
): PromptFile[][] => {
  const promptFiles = createPromptFiles(files, maxPromptPayloadLength);

  return promptsIntoBatches(promptFiles, maxPromptPayloadLength);
};
