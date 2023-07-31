import { exec } from "child_process";
import { join } from "path";

import { getGitHubEnvVariables } from "../../config";

export const getChangedFilesNamesCommand = (isCi: boolean): string => {
  if (isCi) {
    const { githubSha, baseSha } = getGitHubEnvVariables();
    return `git diff --name-only --diff-filter=AMT ${baseSha} ${githubSha}`;
  }
  return "git diff --name-only --diff-filter=AMT --cached";
};

export const getChangedFilesNames = async (
  isCi: boolean
): Promise<string[]> => {
  const commandString = getChangedFilesNamesCommand(isCi);

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
