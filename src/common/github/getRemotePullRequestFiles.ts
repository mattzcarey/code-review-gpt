import { File } from "../types";

export const getRemotePullRequestFiles = async (): Promise<File[]> => {
  try {
    return [];
  } catch (error) {
    throw new Error(`Failed to get remote Pull Request files: ${error}`);
  }
};
