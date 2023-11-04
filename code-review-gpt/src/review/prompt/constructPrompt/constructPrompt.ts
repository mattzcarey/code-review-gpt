import { changedLinesIntoBatches } from "./batchFiles/changedLines";
import { costOptimizedChangedLinesIntoBatches } from "./batchFiles/costOptimizedChangedLines";
import { fullFilesIntoBatches } from "./batchFiles/fullFiles";
import { PromptFile, ReviewFile } from "../../../common/types";
import { instructionPrompt } from "../prompts";



export const constructPromptsArray = (
  files: ReviewFile[],
  maxPromptLength: number,
  reviewType: string,
  largeFileCollector: (promptFile:PromptFile)=>void
): PromptFile[][] => {
  const maxPromptPayloadLength = maxPromptLength - instructionPrompt.length;
  let promptPayloads: PromptFile[][];

  switch (reviewType) {
    case "full":
      promptPayloads = fullFilesIntoBatches(files, maxPromptPayloadLength,largeFileCollector);
      break;
    case "changed":
      promptPayloads = changedLinesIntoBatches(files, maxPromptPayloadLength,largeFileCollector);
      break;
    case "costOptimized":
      promptPayloads = costOptimizedChangedLinesIntoBatches(
        files,
        maxPromptPayloadLength,
        largeFileCollector
      );
      break;

    default:
      throw new Error(
        `Review type ${reviewType} is not supported. Please use one of the following: full, changed, costOptimized.`
      );
  }

 

  return promptPayloads;
};
