import { File } from "../types";
import { extractPullRequestIdentifier } from "./extractPullRequestIdentifier";
import { filterPullRequestFiles } from "./filterPullRequestFiles";
import { GitHubGraphQLClient } from "./GitHubGraphQLClient";
import { GitHubRESTClient } from "./GitHubRESTClient";
import { logger } from "../utils/logger";

export const getRemotePullRequestFiles = async (remotePullRequest: string): Promise<File[]> => {
  const pullRequestIdentifier = extractPullRequestIdentifier(remotePullRequest);
  const gqlClient = new GitHubGraphQLClient();
  const restClient = new GitHubRESTClient();

  try {
    const pullRequest = await gqlClient.getPullRequest(pullRequestIdentifier);
    const filteredPullRequestFiles = filterPullRequestFiles(pullRequest.files);
    const diff = await restClient.fetchPullRequestDiff(pullRequestIdentifier);
    const filesContents = await restClient.fetchCommitFiles(pullRequestIdentifier, pullRequest.headSha, filteredPullRequestFiles);

    logger.info(diff);
    logger.info(filesContents);

    // TODO: for each file associate fileContent and changedLines
    // TODO: return Files[]

    return [];
  } catch (error) {
    throw new Error(`Failed to get remote Pull Request files: ${error}`);
  }
};
