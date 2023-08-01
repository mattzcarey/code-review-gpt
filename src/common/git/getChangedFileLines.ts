import { exec } from "child_process";

import { getGitHubEnvVariables } from "../../config";

export const getChangesFileLinesCommand = (
  isCi: boolean,
  fileName: string
): string => {
  if (isCi) {
    const { githubSha, baseSha } = getGitHubEnvVariables();
    return `git diff -U0 --diff-filter=AMT ${baseSha} ${githubSha} ${fileName}`;
  }
  return `git diff -U0 --diff-filter=AMT --cached ${fileName}`;
};

export const getChangedFileLines = async (
  isCi: boolean,
  fileName: string
): Promise<string> => {
  const commandString = getChangesFileLinesCommand(isCi, fileName);

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
