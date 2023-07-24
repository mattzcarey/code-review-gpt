import { readFile } from "fs/promises";
import { filePromptTemplate, instructionPrompt } from "../constants";

const appendToLastPrompt = (
  prompts: string[],
  text: string,
  maxPromptLength: number
): string[] => {
  const newPrompts = [...prompts];
  const lastPromptIndex = newPrompts.length - 1;

  if ((newPrompts[lastPromptIndex] + text).length > maxPromptLength) {
    newPrompts.push(instructionPrompt + text);
  } else {
    newPrompts[lastPromptIndex] += text;
  }

  return newPrompts;
};

const splitFileContentsIntoChunks = (
  fileContents: string,
  maxChunkSize: number
): string[] => {
  const chunks = [];
  for (let i = 0; i < fileContents.length; i += maxChunkSize) {
    chunks.push(fileContents.slice(i, i + maxChunkSize));
  }
  return chunks;
};

export const constructPromptsArray = async (
  fileNames: string[],
  maxPromptLength: number
): Promise<string[]> => {
  console.info("Constructing prompt...");

  let prompts: string[] = [instructionPrompt];

  for (const fileName of fileNames) {
    try {
      const fileContents = await readFile(fileName, "utf8");
      const fileChunks = splitFileContentsIntoChunks(
        fileContents,
        maxPromptLength
      );

      for (let i = 0; i < fileChunks.length; i++) {
        const fileChunk = fileChunks[i];
        let chunkFileName = fileName;
        if (i !== 0) {
          console.warn(
            `File ${fileName} is too large to fit in a single prompt. Splitting into ${fileChunks.length} chunks.`
          );
          chunkFileName += ` Continued part ${i + 1}`;
        }

        const filePrompt = filePromptTemplate
          .replace("{fileName}", chunkFileName)
          .replace("{fileContents}", fileChunk);

        prompts = appendToLastPrompt(prompts, filePrompt, maxPromptLength);
      }
    } catch (error) {
      console.error(`Failed to process file ${fileName}:`, error);
      throw error;
    }
  }

  return prompts;
};
