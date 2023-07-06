import { exec } from "child_process";
import { promisify } from "util";
import { instructionPrompt, filePromptTemplate } from "./constants";

const execP = promisify(exec);

export const constructPrompt = async (fileNames: string[]): Promise<string> => {
  let fullPrompt = instructionPrompt;

  for (const fileName of fileNames) {
    try {
      const { stdout: gitDiff } = await execP(
        `git diff --unified=10 HEAD -- ${fileName}`
      );

      // Split the gitDiff into chunks.
      const chunks = gitDiff.split(/@@ -[0-9,]+ \+[0-9,]+ @@/);

      let fileChanges = "";

      for (let i = 0; i < chunks.length; i++) {
        let chunk = chunks[i];

        // The first chunk may contain metadata that we want to skip.
        // So we remove the lines that don't start with a +, -, or a space only for the first chunk.
        if (i === 0) {
          chunk = chunk
            .split("\n")
            .filter((line) => /^[\s+-]/.test(line))
            .join("\n");
        }

        if (chunk.trim() !== "") {
          fileChanges += "```\n" + chunk + "\n```\n\n";
        }
      }

      const filePrompt = filePromptTemplate
        .replace("{{fileName}}", fileName)
        .replace("{fileContents}", fileChanges);

      fullPrompt += filePrompt;
    } catch (error) {
      console.error(`Failed to process file ${fileName}:`, error);
    }
  }

  return fullPrompt;
};
