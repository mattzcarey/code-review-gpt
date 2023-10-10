import { extname } from "path";

import { ReviewFile } from "../../../common/types";
import { excludedKeywords, supportedFiles } from "../../constants";

export const filterFiles = (files: ReviewFile[]): ReviewFile[] => {
  const filteredFiles = files.filter((file) => {
    const ext = extname(file.fileName);

    return (
      supportedFiles.has(ext) &&
      ![...excludedKeywords].some((keyword) =>
        file.fileName.includes(keyword)
      ) &&
      file.changedLines.trim() !== ""
    );
  //group files by language to provide model with more context (3 java giles are better than 1 java + 2 typescript)
  }).sort((a,b)=>extname(a.fileName).localeCompare(extname(b.fileName)));

  return filteredFiles;
};
