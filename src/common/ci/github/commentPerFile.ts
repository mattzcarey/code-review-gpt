import { IFeedback } from "../../types";
import { commentOnFile, getOctokitRepoDetails } from "../utils";

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
): Promise<void> => {
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
      await commentOnFile(octokit, {
        feedback,
        signOff,
        owner,
        repo,
        pull_number,
        commit_id,
      });
    }
  }
};
