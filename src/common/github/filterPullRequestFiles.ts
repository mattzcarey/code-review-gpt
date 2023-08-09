import { extname } from "path";
import { PullRequestFile } from "./types";
import { excludedKeywords, supportedFiles } from "../../review/constants";

// see: https://docs.github.com/en/graphql/reference/enums#patchstatus
const excludedFileChangeTypes = ['DELETED'];

const filterFilesByPullRequestChangeType = (files: PullRequestFile[]): PullRequestFile[] => {
  return files.filter((file) => { return !excludedFileChangeTypes.includes(file.changeType); });
}

const filterFilesBySupportedType = (files: PullRequestFile[]): PullRequestFile[] => {
  const filteredFileNames = files.filter((file) => {
    const ext = extname(file.path);
    return (
      supportedFiles.has(ext) &&
      ![...excludedKeywords].some((keyword) => file.path.includes(keyword))
    );
  });

  return filteredFileNames;
};

export const filterPullRequestFiles = (files: PullRequestFile[]): PullRequestFile[] => {
  const filteredFilesByPullRequestChangeType = filterFilesByPullRequestChangeType(files);
  const filteredFiles = filterFilesBySupportedType(filteredFilesByPullRequestChangeType);

  return filteredFiles;
}
