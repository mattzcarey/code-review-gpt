import { context, getOctokit } from "@actions/github";
import { getGitHubEnvVariables } from "../../config";
import { signOff } from "../constants";

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

    const { data: comments } = await octokit.rest.issues.listComments({
      owner,
      repo,
      issue_number: pull_number,
    });

    const botComment = comments.find((comment) =>
      comment?.body?.includes(signOff)
    );

    const botCommentBody = `${comment}\n\n---\n\n${signOff}`;

    if (botComment) {
      await octokit.rest.issues.updateComment({
        owner,
        repo,
        comment_id: botComment.id,
        body: botCommentBody,
      });
    } else {
      // If the bot has not commented yet, create a new comment
      await octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number: pull_number,
        body: botCommentBody,
      });
    }
  } catch (error) {
    console.error(`Failed to comment on PR: ${error}`);
    throw error;
  }
};
