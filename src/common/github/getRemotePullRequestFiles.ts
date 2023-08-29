import { ReviewFile } from "../types";
import { extractPullRequestIdentifier } from "./extractPullRequestIdentifier";
import { GitHubRESTClient } from "./GitHubRESTClient";

export const getRemotePullRequestFiles = async (remotePullRequest: string): Promise<ReviewFile[]> => {
  const pullRequestIdentifier = extractPullRequestIdentifier(remotePullRequest);
  const restClient = new GitHubRESTClient();

  try {
    const files = await restClient.fetchPullRequestFiles(pullRequestIdentifier);

    return files;
  } catch (error) {
    throw new Error(`Failed to get remote Pull Request files: ${error}`);
  }
};
