import { getGitHubEnvVariables } from "../../config";
import { context, getOctokit } from "@actions/github";
import { IFeedback } from "../../review/llm/feedbackProcessor";
import { logger } from "../utils/logger";

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
    logger.warn("Not a pull request. Skipping commenting on PR...");
    return;
  }
  const octokit = getOctokit(githubToken);
  const { owner, repo, number: pull_number } = issue;
  return { octokit, owner, repo, pull_number };
};

export const commentOnFile = async (
  octokit: any,
  data: CreateFileCommentData
) => {
  try {
    const botCommentBody = `${data.feedback.details}\n\n---\n\n${data.signOff}`;

    const { data: comments } = await octokit.rest.pulls.listReviewComments({
      owner: data.owner,
      repo: data.repo,
      pull_number: data.pull_number,
    });

    // Check if bot has already commented on this file
    const relativePath = getRelativePath(data.feedback.fileName, data.repo);
    const botComment = comments.find(
      (comment: any) =>
        comment?.path === relativePath && comment?.body?.includes(data.signOff)
    );

    if (botComment) {
      octokit.rest.pulls.updateReviewComment({
        owner: data.owner,
        repo: data.repo,
        comment_id: botComment.id,
        body: botCommentBody,
      });
    } else {
      await octokit.rest.pulls.createReviewComment({
        owner: data.owner,
        repo: data.repo,
        pull_number: data.pull_number,
        body: botCommentBody,
        commit_id: data.commit_id,
        path: relativePath,
        subject_type: "FILE",
      });
    }
  } catch (error) {
    logger.error(
      `Failed to comment on PR for feedback: ${data.feedback.details}. Error: ${error}`
    );
  }
};

export type CreateFileCommentData = {
  feedback: IFeedback;
  signOff: string;
  owner: string;
  repo: string;
  pull_number: number;
  commit_id: string;
};
