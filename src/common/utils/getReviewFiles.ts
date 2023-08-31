import { ReviewFile } from "../types";

export const getReviewFiles = async (
  platform: string | undefined,
  remotePullRequest: string | undefined
): Promise<ReviewFile[]> => {
  if (remotePullRequest !== undefined) {
    const { getRemotePullRequestFiles } = await import(
      "../remote/github/getRemotePullRequestFiles"
    );

    return await getRemotePullRequestFiles(remotePullRequest);
  } else {
    const { getFilesWithChanges } = await import("../git/getFilesWithChanges");

    return await getFilesWithChanges(platform);
  }
};
