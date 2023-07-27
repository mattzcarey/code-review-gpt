import { getGitHubEnvVariables } from "../../config";

export const gitChangedFileNamesCommand = async (
  isCi: boolean
): Promise<string> => {
  if (isCi) {
    const { githubSha, baseSha } = getGitHubEnvVariables();
    return `git diff --name-only --diff-filter=AMT ${baseSha} ${githubSha}`;
  } else {
    return "git diff --name-only --diff-filter=AMT --cached";
  }
};

export const gitChangedFileLinesCommand = async (
  isCi: boolean,
  fileName: string
): Promise<string> => {
  if (isCi) {
    const { githubSha, baseSha } = getGitHubEnvVariables();
    return `git diff -U0 --diff-filter=AMT ${baseSha} ${githubSha} ${fileName}`;
  } else {
    return `git diff -U0 --diff-filter=AMT --cached ${fileName}`;
  }
};
