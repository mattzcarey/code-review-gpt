import { exec } from "child_process";
import { join } from "path";
import { gitChangedFileNamesCommand } from "../gitCommands";

export const getFileNamesFromGit = async (isCi: boolean): Promise<string[]> => {
  const commandString = await gitChangedFileNamesCommand(isCi);

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
