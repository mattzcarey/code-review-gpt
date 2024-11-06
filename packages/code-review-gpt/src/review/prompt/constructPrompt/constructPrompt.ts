import { changedLinesIntoBatches } from "./batchFiles/changedLines";
import { costOptimizedChangedLinesIntoBatches } from "./batchFiles/costOptimizedChangedLines";
import { fullFilesIntoBatches } from "./batchFiles/fullFiles";
import { PromptFile, ReviewFile } from "../../../common/types";
import { getLanguageName } from "../getLanguageOfFile";
import { instructionPrompt } from "../prompts";

export const constructPromptsArray = (
  files: ReviewFile[],
  maxPromptLength: number,
  reviewType: string,
  reviewLanguage = 'English',
): string[] => {
  const maxPromptPayloadLength = maxPromptLength - instructionPrompt.length;
  let promptPayloads: PromptFile[][];

  switch (reviewType) {
    case "full":
      promptPayloads = fullFilesIntoBatches(files, maxPromptPayloadLength);
      break;
    case "changed":
      promptPayloads = changedLinesIntoBatches(files, maxPromptPayloadLength);
      break;
    case "costOptimized":
      promptPayloads = costOptimizedChangedLinesIntoBatches(
        files,
        maxPromptPayloadLength
      );
      break;

    default:
      throw new Error(
        `Review type ${reviewType} is not supported. Please use one of the following: full, changed, costOptimized.`
      );
  }

  const languageToInstructionPrompt = instructionPrompt
      .replace("{ProgrammingLanguage}", getLanguageName(files[0].fileName))
      .replace("{ReviewLanguage}", reviewLanguage);

  const prompts = promptPayloads.map((payload) => {
    return languageToInstructionPrompt + JSON.stringify(payload);
  });

  return prompts;
};
