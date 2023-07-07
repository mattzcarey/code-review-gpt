import {
  instructionPrompt,
  filePromptTemplate,
  maxPromptLength,
  continuationPrompt,
} from "./constants";
import { readFile } from "fs/promises";

export const constructPromptsArray = async (
  fileNames: string[]
): Promise<string[]> => {
  console.info("Constructing prompt...");

  const prompts: string[] = [instructionPrompt];

  for (const fileName of fileNames) {
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

      if ((prompts[prompts.length - 1] + filePrompt).length > maxPromptLength) {
        prompts.push(continuationPrompt);
      }

      prompts[prompts.length - 1] += filePrompt;
    } catch (error) {
      console.error(`Failed to process file ${fileName}:`, error);
    }
  }

  return prompts;
};
