import { ReviewFile } from "../types";

export const getReviewFiles = async (isCi: string, remotePullRequest: string | undefined): Promise<ReviewFile[]> => {
  if (remotePullRequest !== undefined) {
    const { getRemotePullRequestFiles } = await import(
      "../github/getRemotePullRequestFiles"
    );

    return await getRemotePullRequestFiles(remotePullRequest);
  } else {
    const { getFilesWithChanges } = await import(
      "../git/getFilesWithChanges"
    );

    return await getFilesWithChanges(isCi);
  }
};
