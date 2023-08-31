import { exec } from "child_process";

import { getGitHubEnvVariables, getGitLabEnvVariables } from "../../config";
import { PlatformOptions } from "../types";
export const getChangesFileLinesCommand = (
  isCi: string | undefined,
  fileName: string
): string => {
  if (isCi === PlatformOptions.GITHUB) {
    const { githubSha, baseSha } = getGitHubEnvVariables();

    return `git diff -U0 --diff-filter=AMRT ${baseSha} ${githubSha} ${fileName}`;
  } else if (isCi === PlatformOptions.GITLAB) {
    const { gitlabSha, mergeRequestBaseSha } = getGitLabEnvVariables();

    return `git diff -U0 --diff-filter=AMRT ${mergeRequestBaseSha} ${gitlabSha} ${fileName}`;
  }

  return `git diff -U0 --diff-filter=AMRT --cached ${fileName}`;
};

export const getChangedFileLines = async (
  isCi: string | undefined,
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
