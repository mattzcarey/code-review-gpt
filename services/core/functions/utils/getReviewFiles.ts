import axios from "axios";
import { App } from "octokit";

import {
  GetFilesWithChangesProps,
  isValidCompareCommitsResponse,
  ReviewFile,
} from "./types";

export const getFilesWithChanges = async (
  props: GetFilesWithChangesProps
): Promise<ReviewFile[] | undefined> => {
  try {
    console.log("before");
    crypto.randomUUID();
    const app = new App({
      appId: props.appId,
      privateKey: props.privateKey,
    });

    console.log("before request");
    const response = await app.octokit.request(
      `GET /repos/{owner}/{repo}/compare/{basehead}`,
      {
        owner: props.eventDetail.pull_request.user.login,
        repo: props.eventDetail.repository.name,
        basehead: `${props.eventDetail.pull_request.base.sha}...${props.eventDetail.pull_request.head.sha}`,
      }
    );

    console.log(response);
    if (isValidCompareCommitsResponse(response)) {
      const reviewFiles = await Promise.all(
        response.files.map(async (file) => {
          const fileContent = file.contents_url;
          const fileName = file.filename;
          const changedLines = await getChangedFileLines(file.contents_url);

          return { fileName, fileContent, changedLines };
        })
      );

      return reviewFiles;
    }

    return undefined;
  } catch (error) {
    throw new Error(`Failed to get files with changes: ${error as string}`);
  }
};

export const getChangedFileLines = async (
  diff_url: string
): Promise<string> => {
  const response = await axios.get(diff_url);
  const diffContent = response.data as string;

  return diffContent;
};
