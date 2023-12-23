import { exec } from "child_process";

export const executeCommand = (command: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(
          `Error executing command: ${command}\nError: ${error.message}\nstderr: ${stderr}`
        );
        return reject(error);
      }
      if (stderr) {
        console.warn(
          `Command executed with warnings: ${command}\nstderr: ${stderr}`
        );
      }
      if (stdout) {
        console.log(`Command executed: ${command}\nstdout: ${stdout}`);
      }
      resolve();
    });
  });
};
