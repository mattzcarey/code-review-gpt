import { GitHubRESTClient } from "./GitHubRESTClient";
import { extractPullRequestIdentifier } from "./extractPullRequestIdentifier";
import { ReviewFile } from "../../types";
import { logger } from "../../utils/logger";

export const getRemotePullRequestFiles = async (
  remotePullRequest: string
): Promise<ReviewFile[]> => {
  const pullRequestIdentifier = extractPullRequestIdentifier(remotePullRequest);
  const restClient = new GitHubRESTClient();

  try {
    const files = await restClient.fetchReviewFiles(pullRequestIdentifier);

    return files;
  } catch (error) {
    logger.error("Fetch review files error:",error);
    throw new Error(
      `Failed to get remote Pull Request files: ${JSON.stringify(error)}`
    );
  }
};
