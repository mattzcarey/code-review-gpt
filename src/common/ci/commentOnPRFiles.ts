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
 * Publish in-line comments on the pull request. //? What happens when the bot has already commented on that file
 * @param feedbacks The JSON feedback from the AIModel.
 * @returns void
 */
export const commentOnPRFiles = async (feedbacks: IFeedback[]) => {
  try {
    const githubToken = getToken();
    const { payload, issue } = context;
    console.log(`RepoName: ${issue.repo}`)
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
          console.log(feedback.fileName);
          console.log(feedback.start_line);
          console.log(feedback.end_line);
          console.log(`filename ${getRelativePath(feedback.fileName, issue.repo)}`);
          const botCommentBody = `Line: ${feedback.start_line}-${feedback.end_line}\n\n ${feedback.details}\n\n---\n\n${signOff}`; //todo create a md formatter to make this prettier

          await octokit.rest.pulls.createReviewComment({
            owner,
            repo,
            pull_number,
            body: botCommentBody,
            commit_id,
            path: getRelativePath(feedback.fileName, issue.repo),
            subject_type: 'file',
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

export const getRelativePath = (fileName: string, repoName: string): string => {
  const repoIndex = fileName.lastIndexOf(repoName);
  if (repoIndex !== -1) {
    return fileName.slice(repoIndex + repoName.length + 1); // +1 to skip the trailing slash after the repository name
  } else {
    // If the repository name is not found in the absolute path, return the original absolute path.
    return fileName;
  }
};
