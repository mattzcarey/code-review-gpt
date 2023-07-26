import { context, getOctokit } from "@actions/github";
import { getGitHubEnvVariables } from "../../config";
import { signOff } from "../../review/constants";
import { IFeedback } from "../../review/llm/feedbackProcessor";

const getToken = () => {
  const { githubToken } = getGitHubEnvVariables();
  if (!githubToken) {
    throw new Error("GITHUB_TOKEN is not set");
  }
  return githubToken;
};

// todo need to add testing to this
/**
 * Publish in-line comments on the pull request. 
 * @param feedbacks The JSON feedback from the AIModel.
 * @returns void
 */
export const commentPerFile = async (feedbacks: IFeedback[]) => {
  try {
    const githubToken = getToken();
    const { payload, issue } = context;

    if (!payload.pull_request) {
      console.warn("Not a pull request. Skipping commenting on PR...");
      return;
    }

    const octokit = getOctokit(githubToken);
    const { owner, repo, number: pull_number } = issue;

    // Get PR and commit_id
    const pullRequest = await octokit.rest.pulls.get({
      owner,
      repo,
      pull_number: pull_number,
    });
    const commit_id = pullRequest.data.head.sha;

    // Comment all feedback line by line
    for (const feedback of feedbacks) {
      try {
        const botCommentBody = `${feedback.details}\n\n---\n\n${signOff}`;

        const { data: comments } = await octokit.rest.pulls.listReviewComments({
          owner,
          repo,
          pull_number,
        });

        const relativePath = getRelativePath(feedback.fileName, issue.repo);
        const botComment = comments.find((comment) =>
          comment?.body?.includes(signOff) && comment.path === relativePath
        );

        if (botComment) {
          octokit.rest.pulls.updateReviewComment({
            owner,
            repo,
            comment_id: botComment.id,
            body: botCommentBody,
          });
        } else {
          await octokit.rest.pulls.createReviewComment({
            owner,
            repo,
            pull_number,
            body: botCommentBody,
            commit_id,
            path: relativePath,
            subject_type: "file",
          });
        }
      } catch (error) {
        console.error(
          `Failed to comment on PR for feedback: ${feedback.details}. Error: ${error}`
        );
      }
    }
  } catch (error) {
    console.error(`Failed to get pull request: ${error}`);
  }
};

export const getRelativePath = (fileName: string, repoName: string): string => {
  const repoIndex = fileName.lastIndexOf(repoName);
  if (repoIndex !== -1) {
    return fileName.slice(repoIndex + repoName.length + 1);
  } else {
    // If the repository name is not found in the absolute path, return the original absolute path.
    return fileName;
  }
};
