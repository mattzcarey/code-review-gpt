import {
  instructionPrompt,
  filePromptTemplate,
  maxPromptLength,
  continuationPrompt,
} from "./constants";
import { readFile } from "fs/promises";

const appendToLastPrompt = (prompts: string[], text: string): string[] => {
  const newPrompts = [...prompts];
  const lastPromptIndex = newPrompts.length - 1;

  if ((newPrompts[lastPromptIndex] + text).length > maxPromptLength) {
    newPrompts.push(continuationPrompt + text);
  } else {
    newPrompts[lastPromptIndex] += text;
  }

  return newPrompts;
};

export const constructPromptsArray = async (
  fileNames: string[]
): Promise<string[]> => {
  console.info("Constructing prompt...");

  let prompts: string[] = [instructionPrompt];

  for (const fileName of fileNames) {
    try {
      const fileContents = await readFile(fileName, "utf8");
      const filePrompt = filePromptTemplate
        .replace("{fileName}", fileName)
        .replace("{fileContents}", fileContents);

      if (filePrompt.length > maxPromptLength) {
        console.warn(
          `The file ${fileName} is too large and may cause unexpected behavior such as cut off responses. Skipping this file.`
        );
        continue;
      }

      prompts = appendToLastPrompt(prompts, filePrompt);
    } catch (error) {
      console.error(`Failed to process file ${fileName}:`, error);
      throw error;
    }
  }

  return prompts;
};
