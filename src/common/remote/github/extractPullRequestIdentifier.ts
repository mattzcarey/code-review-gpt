import { PullRequestIdentifier } from './types';

export const extractPullRequestIdentifier = (identifier: string): PullRequestIdentifier => {
  const [owner, repo, prId] = identifier.split(/(\/|#)/);
  const prNumber = parseInt(prId);

  return { owner, repo, prNumber };
}
