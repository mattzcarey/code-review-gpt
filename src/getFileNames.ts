import { exec } from "child_process";
import { extname, join } from "path";
import { supportedFiles } from "./constants";
import { gitCommand } from "./args";

const gitCommandString = gitCommand();

const getStagedFiles = (): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    exec(gitCommandString, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(error.message));
      } else if (stderr) {
        reject(new Error(stderr));
      } else {
        const files = stdout
          .split("\n")
          .filter((fileName) => fileName.trim() !== "")
          .map((fileName) => join(process.cwd(), fileName.trim()));
        resolve(files);
      }
    });
  });
};

export const getFileNames = async (): Promise<string[]> => {
  console.info("Getting files...");
  try {
    const stagedFiles = await getStagedFiles();

    const filteredFiles = stagedFiles.filter((fileName) => {
      const ext = extname(fileName);
      return supportedFiles.has(ext);
    });

    if (filteredFiles.length === 0) {
      process.exit(0);
    }

    return filteredFiles;
  } catch (error) {
    console.error(error);
    return [];
  }
};
