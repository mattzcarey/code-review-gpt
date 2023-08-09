import { File } from "../types";
import { extractPullRequestIdentifier } from "./extractPullRequestIdentifier";
import { filterPullRequestFiles } from "./filterPullRequestFiles";
import { GitHubGraphQLClient } from "./GitHubGraphQLClient";
import { logger } from "../utils/logger";

export const getRemotePullRequestFiles = async (remotePullRequest: string): Promise<File[]> => {
  const pullRequestIdentifier = extractPullRequestIdentifier(remotePullRequest);
  const gqlClient = new GitHubGraphQLClient();

  try {
    const pullRequest = await gqlClient.getPullRequest(pullRequestIdentifier);
    const filteredPullRequestFiles = filterPullRequestFiles(pullRequest.files);
    logger.info(filteredPullRequestFiles);

    // TODO: use GitHub REST API to get Pull Request diff
    // TODO: use GitHub REST API to get filtered files contents at pullRequest.headSha
    // TODO: for each file associate fileContent and changedLines
    // TODO: return Files[]

    return [];
  } catch (error) {
    throw new Error(`Failed to get remote Pull Request files: ${error}`);
  }
};
