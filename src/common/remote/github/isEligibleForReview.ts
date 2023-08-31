import { extname } from "path";

import { excludedKeywords, supportedFiles } from "../../../review/constants";

// see: https://docs.github.com/en/rest/pulls/pulls?apiVersion=2022-11-28#list-pull-requests-files
const excludedFileChangeTypes = ["removed", "unchanged"];

const isSupportedPullRequestFileChange = (status: string): boolean => {
  return !excludedFileChangeTypes.includes(status);
};

const isSupportedFileType = (path: string): boolean => {
  const ext = extname(path);

  return (
    supportedFiles.has(ext) &&
    ![...excludedKeywords].some((keyword) => path.includes(keyword))
  );
};

export const isEligibleForReview = (path: string, status: string): boolean => {
  return isSupportedPullRequestFileChange(status) && isSupportedFileType(path);
};
