import { promises as fsPromises } from "fs";

export const openFile = async (filePath: string): Promise<string> => {
  try {
    const content = await fsPromises.readFile(filePath, "utf8");
    return content;
  } catch (error) {
    console.error("Error reading file:", error);
    throw error;
  }
};
