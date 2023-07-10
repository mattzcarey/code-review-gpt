import { context, getOctokit } from "@actions/github";
import { getGitHubEnvVariables } from "./args";

const getToken = () => {
  const { githubToken } = getGitHubEnvVariables();
  if (!githubToken) {
    throw new Error("GITHUB_TOKEN is not set");
  }
  return githubToken;
};

export const commentOnPR = async (comment: string) => {
  try {
    const githubToken = getToken();
    const { payload, issue } = context;

    if (!payload.pull_request) {
      console.warn("Not a pull request. Skipping commenting on PR...");
      return;
    }

    const octokit = getOctokit(githubToken);

    const { owner, repo, number: pull_number } = issue;

    await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: pull_number,
      body: comment,
    });
  } catch (error) {
    console.error(`Failed to comment on PR: ${error}`);
    throw error;
  }
};
