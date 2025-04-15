import type { PromptFile, ReviewFile } from '../../common/types';
import { logger } from '../../common/utils/logger';
import { batchPrompts, createPromptFiles, createReviewPreamble } from './construct';
import { instructionPrompt } from './prompts';
import { getLanguageName } from './utils/fileLanguage';

export const constructPromptsArray = (
  files: ReviewFile[],
  maxPromptLength: number,
  reviewType: string,
  reviewLanguage: string
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
    default:
      throw new Error(
        `Review type ${reviewType} is not supported. Please use one of the following: full, changed.`
      );
  }

  const { batches, skippedFiles } = batchPrompts(allPromptFiles);

  if (skippedFiles.length > 0) {
    logger.info(`Skipped ${skippedFiles.length} files due to size constraints.`);
    logger.debug(`Skipped files: ${skippedFiles.map((file) => file.fileName).join(', ')}`);
  }

  const languageToInstructionPrompt = instructionPrompt
    .replace('{ProgrammingLanguage}', getLanguageName(files[0].fileName))
    .replace('{ReviewLanguage}', reviewLanguage);

  const preamble = createReviewPreamble(allPromptFiles);

  const prompts = batches.map((batch: PromptFile[]) => {
    const payloadString = batch
      .map((file) => {
        const languageName = getLanguageName(file.fileName) || '';
        return `--- File: ${file.fileName} ---\n\`\`\`${languageName}\n${file.promptContent}\n\`\`\`\n`;
      })
      .join('\n');

    return `${preamble}${languageToInstructionPrompt}\n${payloadString}`;
  });

  logger.debug(`Prompts used:\n ${prompts.join('\n')}`);

  return prompts;
};
