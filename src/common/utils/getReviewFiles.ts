import { File } from "../types";

export const getReviewFiles = async (isCi: string, remotePullRequest: string): Promise<File[]> => {
  if (remotePullRequest !== undefined) {
    const { getRemotePullRequestFiles } = await import(
      "../github/getRemotePullRequestFiles"
    );

    return await getRemotePullRequestFiles();
  } else {
    const { getFilesWithChanges } = await import(
      "../git/getFilesWithChanges"
    );

    return await getFilesWithChanges(isCi);
  }
};
