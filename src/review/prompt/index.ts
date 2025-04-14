import type { PromptFile, ReviewFile } from '../../common/types';
import { MAX_SURROUNDING_LINES } from '../constants';
import { batchPrompts, createPromptFiles, createReviewPreamble } from './construct';
import { instructionPrompt } from './prompts';
import { getLanguageName } from './utils/fileLanguage';

export const constructPromptsArray = (
  files: ReviewFile[],
  maxPromptLength: number,
  reviewType: string,
  reviewLanguage = 'English'
): string[] => {
  const maxChunkPayloadLength = maxPromptLength - instructionPrompt.length;

  let allPromptFiles: PromptFile[];

  switch (reviewType) {
    case 'full': {
      allPromptFiles = files.map((file) => ({
        fileName: file.fileName,
        promptContent: file.fileContent
          .split('\n')
          .map((line) => `+${line}`)
          .join('\n'),
      }));
      break;
    }
    case 'changed': {
      allPromptFiles = createPromptFiles(files, maxChunkPayloadLength);
      break;
    }
    case 'costOptimized': {
      allPromptFiles = createPromptFiles(files, maxChunkPayloadLength, MAX_SURROUNDING_LINES);
      break;
    }
    default:
      throw new Error(
        `Review type ${reviewType} is not supported. Please use one of the following: full, changed, costOptimized.`
      );
  }

  const { batches, skippedFiles } = batchPrompts(allPromptFiles);

  const languageToInstructionPrompt = instructionPrompt
    .replace('{ProgrammingLanguage}', getLanguageName(files[0].fileName))
    .replace('{ReviewLanguage}', reviewLanguage);

  const prompts = batches.map((batch: PromptFile[]) => {
    const preamble = createReviewPreamble(batch);
    const payload = JSON.stringify(batch);
    return preamble + languageToInstructionPrompt + payload;
  });

  return prompts;
};
