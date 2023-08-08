import { File } from "../types";
import { extractPullRequestIdentifier } from "./extractPullRequestIdentifier";
import { GitHubGraphQLClient } from "./GitHubGraphQLClient";
import { logger } from "../utils/logger";

export const getRemotePullRequestFiles = async (remotePullRequest: string): Promise<File[]> => {
  const pullRequestIdentifier = extractPullRequestIdentifier(remotePullRequest);
  const gqlClient = new GitHubGraphQLClient();

  try {
    const pullRequest = await gqlClient.getPullRequest(pullRequestIdentifier);
    logger.info(pullRequest);

    // TODO: filter pullRequest.files to exclude deleted files
    // TODO: filter pullRequest.files to include only supported file types (e.g. TypeScript)
    // TODO: use GitHub REST API to get Pull Request diff
    // TODO: use GitHub REST API to get filtered files contents at pullRequest.headSha
    // TODO: for each file associate fileContent and changedLines
    // TODO: return Files[]

    return [];
  } catch (error) {
    throw new Error(`Failed to get remote Pull Request files: ${error}`);
  }
};
