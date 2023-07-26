import { getGitHubEnvVariables } from "../../config";

export const getRelativePath = (fileName: string, repoName: string): string => {
  const repoIndex = fileName.lastIndexOf(repoName);
  if (repoIndex !== -1) {
    return fileName.slice(repoIndex + repoName.length + 1);
  } else {
    // If the repository name is not found in the absolute path, return the original absolute path.
    return fileName;
  }
};

export const getToken = () => {
  const { githubToken } = getGitHubEnvVariables();
  if (!githubToken) {
    throw new Error("GITHUB_TOKEN is not set");
  }
  return githubToken;
};
