import type { PullRequestIdentifier } from './types';

export const extractPullRequestIdentifier = (identifier: string): PullRequestIdentifier => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [owner, _, repo, __, prId] = identifier.split(/(\/|#)/);
  const prNumber = Number.parseInt(prId);

  return { owner, repo, prNumber };
};
