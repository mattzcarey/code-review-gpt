import { exec } from "child_process";
import { readFile } from "fs/promises";
import { join } from "path";

import { ReviewFile } from "./types";

export const getFilesWithChanges = async (
  baseSha: string,
  headSha: string
): Promise<ReviewFile[] | undefined> => {
  try {
    const fileNames = await getChangedFilesNames(baseSha, headSha);

    if (fileNames.length === 0) {
      return undefined;
    }

    const files = await Promise.all(
      fileNames.map(async (fileName) => {
        const fileContent = await readFile(fileName, "utf8");
        const changedLines = await getChangedFileLines(
          fileName,
          baseSha,
          headSha
        );

        return { fileName, fileContent, changedLines };
      })
    );

    return files;
  } catch (error) {
    throw new Error(
      `Failed to get files with changes: ${JSON.stringify(error)}`
    );
  }
};

export const getChangedFilesNames = async (
  baseSha: string,
  headSha: string
): Promise<string[]> => {
  const commandString = `git diff --name-only --diff-filter=AMRT ${baseSha} ${headSha}`;

  return new Promise((resolve, reject) => {
    exec(commandString, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`Failed to execute command. Error: ${error.message}`));
      } else if (stderr) {
        reject(new Error(`Command execution error: ${stderr}`));
      } else {
        const files = stdout
          .split("\n")
          .filter((fileName) => fileName.trim() !== "")
          .map((fileName) => join(process.cwd(), fileName.trim()));
        resolve(files);
      }
    });
  });
};

export const getChangedFileLines = async (
  fileName: string,
  baseSha: string,
  headSha: string
): Promise<string> => {
  const commandString = `git diff -U0 --diff-filter=AMRT ${baseSha} ${headSha} ${fileName}`;

  return new Promise((resolve, reject) => {
    exec(commandString, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`Failed to execute command. Error: ${error.message}`));
      } else if (stderr) {
        reject(new Error(`Command execution error: ${stderr}`));
      } else {
        const changedLines = stdout
          .split("\n")
          .filter((line) => line.startsWith("+") || line.startsWith("-"))
          .filter((line) => !line.startsWith("---") && !line.startsWith("+++"))
          .join("\n");
        resolve(changedLines);
      }
    });
  });
};
