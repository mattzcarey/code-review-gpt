import { exec } from "child_process";
import { promisify } from "util";
import { instructionPrompt, filePromptTemplate } from "./constants";

const execP = promisify(exec);

export const constructPrompt = async (fileNames: string[]): Promise<string> => {
  console.info("Constructing prompt...");
  let fullPrompt = instructionPrompt;

  for (const fileName of fileNames) {
    try {
      const { stdout: fileContent } = await execP(`cat ${fileName}`);

      const filePrompt = filePromptTemplate
        .replace("{{fileName}}", fileName)
        .replace("{fileContents}", fileContent);

      fullPrompt += filePrompt;
    } catch (error) {
      console.error(`Failed to process file ${fileName}:`, error);
    }
  }

  return fullPrompt;
};
