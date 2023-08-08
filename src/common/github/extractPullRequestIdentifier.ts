export const extractPullRequestIdentifier = (identifier: string): PullRequestIdentifier => {
  const [owner, _, repo, __, prId] = identifier.split(/(\/|#)/);
  const prNumber = parseInt(prId);

  return { owner, repo, prNumber };
}
