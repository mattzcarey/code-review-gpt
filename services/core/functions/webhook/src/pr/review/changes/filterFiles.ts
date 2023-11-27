import { extname } from "path";

import { excludedKeywords, supportedFiles } from "../../../constants";
import { ChangedFile } from "../../../types";

export const filterFiles = (
  changedFiles: string[],
  allFiles: ChangedFile[]
): ChangedFile[] => {
  return allFiles.filter(
    (file) =>
      changedFiles.includes(file.filename) &&
      supportedFiles.has(extname(file.filename)) &&
      ![...excludedKeywords].some((keyword) => file.filename.includes(keyword))
  );
};
