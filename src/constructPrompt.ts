import {
  instructionPrompt,
  filePromptTemplate,
  maxPromptLength,
  continuationPrompt,
} from "./constants";
import { readFile } from "fs/promises";

const appendFilePrompt = (prompts: string[], filePrompt: string): string[] => {
  const newPrompts = [...prompts];
  if (
    (newPrompts[newPrompts.length - 1] + filePrompt).length > maxPromptLength
  ) {
    newPrompts.push(continuationPrompt);
  }
  newPrompts[newPrompts.length - 1] += filePrompt;

  return newPrompts;
};

export const constructPromptsArray = async (
  fileNames: string[]
): Promise<string[]> => {
  console.info("Constructing prompt...");

  const filePromises = fileNames.map(async (fileName) => {
    try {
      const fileContents = await readFile(fileName, "utf8");
      const filePrompt = filePromptTemplate
        .replace("{fileName}", fileName)
        .replace("{fileContents}", fileContents);

      if (filePrompt.length > maxPromptLength) {
        console.warn(
          `The file ${fileName} is too large and may cause unexpected behavior such as cut off responses. Skipping this file.`
        );
        // Skip this file and don't append the prompt.
        return undefined;
      }

      return filePrompt;
    } catch (error) {
      console.error(`Failed to process file ${fileName}:`, error);
      throw error;
    }
  });

  const filePrompts = (await Promise.all(filePromises)).filter(
    (filePrompt): filePrompt is string => filePrompt !== undefined
  );

  const prompts = [instructionPrompt];
  filePrompts.forEach((filePrompt) => {
    appendFilePrompt(prompts, filePrompt);
  });

  return prompts;
};
