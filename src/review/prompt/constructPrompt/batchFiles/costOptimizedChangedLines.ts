import type { PromptFile, ReviewFile } from '../../../../common/types';
import { MAX_SURROUNDING_LINES } from '../../../constants';
import { createPromptFiles } from './utils/createPromptFiles';
import { promptsIntoBatches } from './utils/promptsIntoBatches';

export const costOptimizedChangedLinesIntoBatches = (
  files: ReviewFile[],
  maxPromptPayloadLength: number
): PromptFile[][] => {
  const promptFiles = createPromptFiles(files, maxPromptPayloadLength, MAX_SURROUNDING_LINES);

  return promptsIntoBatches(promptFiles, maxPromptPayloadLength);
};
