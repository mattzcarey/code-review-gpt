import { exec } from "child_process";
import { promises as fsPromises } from "fs";
import os from "os";
import join from "path";

export class CRGPTLoader {
  private link: string;

  constructor(link: string) {
    this.link = link;
  }

  public async load(): Promise<void> {
    try {
      // Create a temporary directory using the promises API
      const tempDir = await fsPromises.mkdtemp(
        join(os.tmpdir(), "CRGPTLoader-")
      );

      // Clone the repository with depth 1 to get only the latest state of the main branch
      const cloneCommand = `git clone --depth 1 --filter=blob:none ${this.link} ${tempDir}`;
      await this.executeCommand(cloneCommand);

      // Loop through the files in the cloned directory
      const files = await fsPromises.readdir(tempDir);
      for (const file of files) {
        console.log(`${tempDir}/${file}`);
      }

      // Delete the cloned files
      await this.executeCommand(`rm -rf ${tempDir}`);
    } catch (error) {
      console.error("Error in CRGPTLoader:", error);
    }
  }

  private async executeCommand(command: string): Promise<void> {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  }
}
