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

  const prompts: string[] = [instructionPrompt];

  const filePromises = fileNames.map(async (fileName) => {
    try {
      const fileContents = await readFile(fileName, "utf8");
      const filePrompt = filePromptTemplate
        .replace("{fileName}", fileName)
        .replace("{fileContents}", fileContents);

      if (filePrompt.length > maxPromptLength) {
        console.warn(
          `The file ${fileName} is too large and may cause unexpected behavior such as cut off responses.`
        );
      }

      return appendFilePrompt(prompts, filePrompt);
    } catch (error) {
      console.error(`Failed to process file ${fileName}:`, error);
      throw error;
    }
  });

  return (await Promise.all(filePromises)).flat();
};
