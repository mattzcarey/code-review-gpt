import { File } from "../types";
import { extractPullRequestIdentifier } from "./extractPullRequestIdentifier";
import { filterPullRequestFiles } from "./filterPullRequestFiles";
import { associateFilesWithContents } from "./associateFilesWithContents";
import { GitHubGraphQLClient } from "./GitHubGraphQLClient";
import { GitHubRESTClient } from "./GitHubRESTClient";

export const getRemotePullRequestFiles = async (remotePullRequest: string): Promise<File[]> => {
  const pullRequestIdentifier = extractPullRequestIdentifier(remotePullRequest);
  const gqlClient = new GitHubGraphQLClient();
  const restClient = new GitHubRESTClient();

  try {
    const pullRequest = await gqlClient.fetchPullRequest(pullRequestIdentifier);
    const filteredPullRequestFiles = filterPullRequestFiles(pullRequest.files);
    const pullRequestDiff = await restClient.fetchPullRequestDiff(pullRequestIdentifier);
    const gitCommitFiles = await restClient.fetchCommitFiles(pullRequestIdentifier, pullRequest.headSha, filteredPullRequestFiles);
    const files = associateFilesWithContents(pullRequestDiff, gitCommitFiles);

    return files;
  } catch (error) {
    throw new Error(`Failed to get remote Pull Request files: ${error}`);
  }
};
