import { getGitHubEnvVariables } from "../../config";
import { context, getOctokit } from "@actions/github";

export const getRelativePath = (fileName: string, repoName: string): string => {
  const repoIndex = fileName.lastIndexOf(repoName);
  if (repoIndex !== -1) {
    return fileName.slice(repoIndex + repoName.length + 1);
  } else {
    // If the repo name is not in the absolute path, return the original absolute path.
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

export const getOctokitRepoDetails = () => {
  const githubToken = getToken();
  const { payload, issue } = context;

  if (!payload.pull_request) {
    console.warn("Not a pull request. Skipping commenting on PR...");
    return;
  }
  const octokit = getOctokit(githubToken);
  const { owner, repo, number: pull_number } = issue;
  return { octokit, owner, repo, pull_number };
};
