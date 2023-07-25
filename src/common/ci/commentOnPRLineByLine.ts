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

/**
 * Publish in-line comments on the pull request. //? What happens when the bot has already commented on that line
 * @param feedbacks The JSON feedback from the AIModel.
 * @returns void
 */
export const commentOnPRLineByLine = async (feedbacks: IFeedback[]) => {
  try {
    const githubToken = getToken();
    const { payload, issue } = context;

    if (!payload.pull_request) {
      console.warn("Not a pull request. Skipping commenting on PR...");
      return;
    }

    const octokit = getOctokit(githubToken);
    const { owner, repo, number: pull_number } = issue;

    try {
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
          await octokit.rest.pulls.createReviewComment({
            owner,
            repo,
            pull_number,
            body: feedback.details,
            commit_id,
            path: feedback.fileName,
            line: feedback.line,
            side: "LEFT"
          });
        } catch (error) {
          console.error(
            `Failed to comment on PR for feedback: ${feedback.details}. Error: ${error}`
          );
        }
      }
    } catch (error) {
      console.error(`Failed to get pull request: ${error}`);
    }

    // Comment all feedback line by line
  } catch (error) {
    console.error(`Failed to comment on PR: ${error}`);
    throw error;
  }
};
