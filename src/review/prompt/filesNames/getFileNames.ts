import { extname } from "path";
import { excludedKeywords, supportedFiles } from "../../constants";
import { getFileNamesFromGit } from "./getFileNamesFromGit";

const filterFiles = (fileNames: string[]): string[] => {
  const filteredFileNames = fileNames.filter((fileName) => {
    const ext = extname(fileName);
    return (
      supportedFiles.has(ext) &&
      ![...excludedKeywords].some((keyword) => fileName.includes(keyword))
    );
  });

  return filteredFileNames;
};

export const getFileNames = async (isCi: boolean): Promise<string[]> => {
  console.info("Getting files...");
  try {
    const fileNames = await getFileNamesFromGit(isCi);

    const filteredFileNames = filterFiles(fileNames);

    if (filteredFileNames.length === 0) {
      process.exit(0);
    }

    return filteredFileNames;
  } catch (error) {
    console.error(`Failed to get files: ${error}`);
    throw error;
  }
};
