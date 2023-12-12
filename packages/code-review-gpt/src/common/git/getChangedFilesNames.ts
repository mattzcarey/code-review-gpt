import { exec } from "child_process";
import { join } from "path";

import { getGitHubEnvVariables, getGitLabEnvVariables } from "../../config";
import { PlatformOptions } from "../types";

export const getChangedFilesNamesCommand = (
  isCi: string | undefined
): string => {
  if (isCi === PlatformOptions.GITHUB) {
    const { githubSha, baseSha } = getGitHubEnvVariables();

    return `git diff --name-only --diff-filter=AMRT ${baseSha} ${githubSha}`;
  } else if (isCi === PlatformOptions.GITLAB) {
    const { gitlabSha, mergeRequestBaseSha } = getGitLabEnvVariables();

    return `git diff --name-only --diff-filter=AMRT ${mergeRequestBaseSha} ${gitlabSha}`;
  }

  return "git diff --name-only --diff-filter=AMRT --cached";
};

export const getGitRoot = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    exec("git rev-parse --show-toplevel", (error, stdout) => {
      if (error) {
        reject(new Error(`Failed to find git root. Error: ${error.message}`));
      } else {
        resolve(stdout.trim());
      }
    });
  });
};

export const getChangedFilesNames = async (
  isCi: string | undefined
): Promise<string[]> => {
  const gitRoot = await getGitRoot();
  const commandString = getChangedFilesNamesCommand(isCi);

  return new Promise((resolve, reject) => {
    exec(commandString, { cwd: gitRoot }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`Failed to execute command. Error: ${error.message}`));
      } else if (stderr) {
        reject(new Error(`Command execution error: ${stderr}`));
      } else {
        const files = stdout
          .split("\n")
          .filter((fileName) => fileName.trim() !== "")
          .map((fileName) => join(gitRoot, fileName.trim()));
        resolve(files);
      }
    });
  });
};
