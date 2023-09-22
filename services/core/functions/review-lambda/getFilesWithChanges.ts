import { App } from "octokit";

import {
  GetFilesWithChangesArgs,
  isValidCompareCommitsResponse,
  ReviewFile,
} from "../utils/types";

export const getFilesWithChanges = async (
  args: GetFilesWithChangesArgs
): Promise<ReviewFile[] | undefined> => {
  try {
    console.log("before create app");

    const app = new App({
      appId: args.appId,
      privateKey: args.privateKey,
    });

    console.log("before installation");
    console.log(`args.installationId: ${args.installationId}`);
    const octokit = await app.getInstallationOctokit(args.installationId);
    console.log("before request");
    const response = await octokit.request(
      `GET /repos/{owner}/{repo}/compare/{basehead}`,
      {
        owner: args.eventDetail.pull_request.user.login,
        repo: args.eventDetail.repository.name,
        basehead: `${args.eventDetail.pull_request.base.sha}...${args.eventDetail.pull_request.head.sha}`,
      }
    );

    console.log(response);
    if (isValidCompareCommitsResponse(response)) {
      const reviewFiles = await Promise.all(
        response.files.map(async (file) => {
          const fileContent = file.contents_url;
          const fileName = file.filename;
          // const changedLines = await getChangedFileLines(file.contents_url);

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


