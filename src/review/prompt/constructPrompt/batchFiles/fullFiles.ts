import type { PromptFile, ReviewFile } from '../../../../common/types';
import { promptsIntoBatches } from './utils/promptsIntoBatches';

export const fullFilesIntoBatches = (files: ReviewFile[], maxBatchSize: number): PromptFile[][] => {
  const promptFiles = files.map((file) => ({
    fileName: file.fileName,
    promptContent: file.fileContent
      .split('\n')
      .map((line) => `+${line}`) //add a plus sign to each line to indicate that it is an added line
      .join('\n'),
  }));

  return promptsIntoBatches(promptFiles, maxBatchSize);
};
