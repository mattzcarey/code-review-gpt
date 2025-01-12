import type { ReviewFile } from '../types';

export const getReviewFiles = async (
  isCi: string | undefined,
  remotePullRequest: string | undefined
): Promise<ReviewFile[]> => {
  if (remotePullRequest !== undefined) {
    const { getRemotePullRequestFiles } = await import(
      '../remote/github/getRemotePullRequestFiles'
    );

    return await getRemotePullRequestFiles(remotePullRequest);
  }
  const { getFilesWithChanges } = await import('../git/getFilesWithChanges');

  return await getFilesWithChanges(isCi);
};
