import { exec } from "child_process";
import { gitChangedFileLinesCommand } from "../gitCommands";
import { ReviewFile } from "../types";

export const getChangedLines = async (
  file: ReviewFile,
  isCi: boolean
): Promise<string> => {
  const gitCommand = await gitChangedFileLinesCommand(isCi, file.fileName);

  return new Promise((resolve, reject) => {
    exec(gitCommand, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(error.message));
      } else if (stderr) {
        reject(new Error(stderr));
      } else {
        const changedLines = stdout
          .split("\n")
          .filter((line) => line.startsWith("+") || line.startsWith("-"))
          .filter((line) => !line.startsWith("---") && !line.startsWith("+++"))
          .join("\n");
        resolve(changedLines);
      }
    });
  });
};
