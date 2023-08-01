import { readFile } from "fs/promises";
import { getChangedFileLines } from "./getChangedFileLines";
import { getChangedFilesNames } from "./getChangedFilesNames";
import { File } from "../types/File";

export const getFilesWithChanges = async (isCi: boolean): Promise<File[]> => {
  try {
    const fileNames = await getChangedFilesNames(isCi);

    const files = await Promise.all(
      fileNames.map(async (fileName) => {
        const fileContent = await readFile(fileName, "utf8");
        const changedLines = await getChangedFileLines(isCi, fileName);

        return { fileName, fileContent, changedLines };
      })
    );

    return files;
  } catch (error) {
    throw new Error(`Failed to get files with changes: ${error}`);
  }
};
