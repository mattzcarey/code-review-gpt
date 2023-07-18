import { context, getOctokit } from "@actions/github";
import { getGitHubEnvVariables } from "../../config";
import { signOff } from "../constants";


export const commentOnPR = async (comment: string) => {
  try {
    const { baseSha, githubToken } = getGitHubEnvVariables()

    if (!githubToken) {
      throw new Error("GITHUB_TOKEN is not set");
    }

    const { payload, issue } = context;

    if (!payload.pull_request) {
      console.warn("Not a pull request. Skipping commenting on PR...");
      return;
    }

    const octokit = getOctokit(githubToken);
    const { owner, repo, number: pull_number } = issue;

    const baseCommentConfig = {
      pull_number,
      repo,
      owner,
      commit_id: baseSha,
    };

    const regex = /File: (.+): Line: (\d+): Comment: (.+)/g;

    const matches = [...comment.matchAll(regex)];

    Promise.all(
      matches.map(async (match) => {
        const fullConfig = {
          ...baseCommentConfig,
          line: Number(match[2]),
          body: match[3],
          path: match[1],
        };
        console.log(fullConfig);

        await octokit.rest.pulls.createReviewComment(fullConfig);
      })
    );

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
