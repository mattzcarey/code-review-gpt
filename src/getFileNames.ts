import { exec } from "child_process";
import { extname, join } from "path";
import { supportedFiles } from "./constants";
import { gitCommand } from "./args";

const gitCommandString = gitCommand();
console.log(gitCommandString);

const getStagedFiles = (): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    exec(gitCommandString, (error, stdout, stderr) => {
      if (error) {
        reject(`Error executing command: ${error.message}`);
      } else if (stderr) {
        reject(`Error: ${stderr}`);
      } else {
        const files = stdout
          .split("\n")
          .filter((fileName) => fileName.trim() !== "")
          .map((fileName) => join(process.cwd(), fileName.trim()));
        console.debug(`Files to process: ${files}`);
        resolve(files);
      }
    });
  });
};

export const getFileNames = async (): Promise<string[]> => {
  console.info("Getting staged files...");
  try {
    const stagedFiles = await getStagedFiles();

    const filteredFiles = stagedFiles.filter((fileName) => {
      const ext = extname(fileName);
      return supportedFiles.has(ext);
    });

    if (filteredFiles.length === 0) {
      console.error("No supported files found to process. Exiting program...");
      process.exit(0);
    }

    return filteredFiles;
  } catch (error) {
    console.error(error);
    return [];
  }
};
