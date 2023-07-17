import { exec } from "child_process";
import { extname, join } from "path";
import { supportedFiles } from "../constants";
import { getGitHubEnvVariables } from "../../config";

const gitCommand = async (isCi: boolean): Promise<string> => {
  if (isCi) {
    const { githubSha, baseSha } = getGitHubEnvVariables();
    return `git diff --name-only --diff-filter=AMT ${baseSha} ${githubSha}`;
  } else {
    return "git diff --name-only --diff-filter=AMT --cached";
  }
};

const getStagedFiles = async (isCi: boolean): Promise<string[]> => {
  const commandString = await gitCommand(isCi);

  return new Promise((resolve, reject) => {
    exec(commandString, (error, stdout, stderr) => {
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

export const getFileNames = async (isCi: boolean): Promise<string[]> => {
  console.info("Getting files...");
  try {
    const stagedFiles = await getStagedFiles(isCi);

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
