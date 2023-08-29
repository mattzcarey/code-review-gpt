import { ReviewFile } from "../types";
import { extractPullRequestIdentifier } from "./extractPullRequestIdentifier";
import { GitHubRESTClient } from "./GitHubRESTClient";

export const getRemotePullRequestFiles = async (remotePullRequest: string): Promise<ReviewFile[]> => {
  const pullRequestIdentifier = extractPullRequestIdentifier(remotePullRequest);
  const restClient = new GitHubRESTClient();

  try {
    const files = await restClient.fetchPullRequestFiles(pullRequestIdentifier);
    // const pullRequest = await gqlClient.fetchPullRequest(pullRequestIdentifier);
    // const filteredPullRequestFiles = filterPullRequestFiles(pullRequest.files);
    // const pullRequestDiff = await restClient.fetchPullRequestDiff(pullRequestIdentifier);
    // const gitCommitFiles = await restClient.fetchCommitFiles(pullRequestIdentifier, pullRequest.headSha, filteredPullRequestFiles);
    // const files = associateFilesWithContents(pullRequestDiff, gitCommitFiles);

    return files;
  } catch (error) {
    throw new Error(`Failed to get remote Pull Request files: ${error}`);
  }
};
