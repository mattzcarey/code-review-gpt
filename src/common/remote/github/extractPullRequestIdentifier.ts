import { PullRequestIdentifier } from "./types";

export const extractPullRequestIdentifier = (
  identifier: string
): PullRequestIdentifier => {
  const [owner, _, repo, __, prId] = identifier.split(/(\/|#)/);

  if (!owner || !repo || !prId) {
    throw new Error(
      `Invalid Pull Request identifier: ${identifier}. Expected format: owner/repo#prNumber`
    );
  }
  const prNumber = parseInt(prId);

  return { owner, repo, prNumber };
};
