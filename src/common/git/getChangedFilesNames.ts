import { exec } from "child_process";
import { join } from "path";

import { getGitHubEnvVariables, getGitLabEnvVariables } from "../../config";
import { GITHUB, GITLAB } from "../../constants";

export const getChangedFilesNamesCommand = async (isCi: string): Promise<string> => {
  if (isCi === GITHUB) {
    const { githubSha, baseSha } = getGitHubEnvVariables();
    return `git diff --name-only --diff-filter=AMT ${baseSha} ${githubSha}`;
  } else if (isCi === GITLAB) {
    const { mergeRequestBaseSha } = await getGitLabEnvVariables();
    return `git diff --name-only ${mergeRequestBaseSha}...HEAD`;
  }
  return "git diff --name-only --diff-filter=AMT --cached";
};

export const getChangedFilesNames = async (
  isCi: string
): Promise<string[]> => {
  const commandString = await getChangedFilesNamesCommand(isCi);

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
