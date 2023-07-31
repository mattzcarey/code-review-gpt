import { extname } from "path";
import { File } from "../../../common/types";
import { excludedKeywords, supportedFiles } from "../../constants";

export const filterFiles = (files: File[]): File[] => {
  const filteredFileNames = files.filter((file) => {
    const ext = extname(file.fileName);
    return (
      supportedFiles.has(ext) &&
      ![...excludedKeywords].some((keyword) => file.fileName.includes(keyword))
    );
  });

  return filteredFileNames;
};
