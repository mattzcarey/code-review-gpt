import { IFeedback } from "../../review/llm/feedbackProcessor";
import { getRelativePath, getOctokitRepoDetails } from "./utils";

/**
 * Publish comments on a file-by-file basis on the pull request. If the bot has already commented on a file (i.e. a comment with the same sign off exists on that file), update the comment instead of creating a new one.
 * The comment will be signed off with the provided sign off.
 * @param feedbacks The JSON feedback from the AIModel.
 * @param signOff The sign off to use. This also serves as key to check if the bot has already commented and update the comment instead of posting a new one if necessary.
 * @returns void
 */
export const commentPerFile = async (
  feedbacks: IFeedback[],
  signOff: string
) => {
  try {
    const octokitRepoDetails = getOctokitRepoDetails();
    if (octokitRepoDetails) {
      const { octokit, owner, repo, pull_number } = octokitRepoDetails;

      // Get PR and commit_id
      const pullRequest = await octokit.rest.pulls.get({
        owner,
        repo,
        pull_number: pull_number,
      });
      const commit_id = pullRequest.data.head.sha;

      // Comment all feedback file by file
      for (const feedback of feedbacks) {
        try {
          const botCommentBody = `${feedback.details}\n\n---\n\n${signOff}`;

          const { data: comments } =
            await octokit.rest.pulls.listReviewComments({
              owner: owner,
              repo: repo,
              pull_number: pull_number,
            });

          // Check if bot has already commented on this file
          const relativePath = getRelativePath(feedback.fileName, repo);
          const botComment = comments.find(
            (comment) =>
              comment?.path === relativePath && comment?.body?.includes(signOff)
          );

          if (botComment) {
            octokit.rest.pulls.updateReviewComment({
              owner: owner,
              repo: repo,
              comment_id: botComment.id,
              body: botCommentBody,
            });
          } else {
            await octokit.rest.pulls.createReviewComment({
              owner: owner,
              repo: repo,
              pull_number: pull_number,
              body: botCommentBody,
              commit_id: commit_id,
              path: relativePath,
              subject_type: "FILE",
            });
          }
        } catch (error) {
          console.error(
            `Failed to comment on PR for feedback: ${feedback.details}. Error: ${error}`
          );
        }
      }
    }
  } catch (error) {
    console.error(`Failed to get pull request: ${error}`);
  }
};
