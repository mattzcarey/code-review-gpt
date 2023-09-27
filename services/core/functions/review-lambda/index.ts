/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import axios from "axios";

import {
  getChangedFileLines,
  getCompareCommitsResponse,
  getInstallationAccessToken,
} from "./utils";
import { review } from "../../../../code-review-gpt/src/review";
import {
  isValidEventDetail,
  ReviewEvent,
  ReviewFile,
  ValidFileObject,
} from "../utils/types";

export const main = async (event: ReviewEvent): Promise<void> => {
  console.log(event.detail);
  const eventDetail = event.detail;

  if (!isValidEventDetail(eventDetail)) {
    throw new Error(
      "Error fetching event in review-lambda event is of an unexpected shape"
    );
  }

  try {
    //Get installation access token from GitHub
    const installationAccessToken = await getInstallationAccessToken(
      eventDetail
    );

    //Compare base and head commits for pull request
    const compareCommitsResponse = await getCompareCommitsResponse(
      eventDetail,
      installationAccessToken
    );

    //Create args object for review
    //todo is there a better way to get this object?
    const args = {
      model: "gpt-3.5-turbo",
      reviewType: "changed",
      setupTarget: "github",
      ci: undefined,
      org: undefined,
      commentPerFile: false,
      remote: undefined,
      _: [],
      $0: "",
    };

    //Create review files array for review
    const reviewFiles: ReviewFile[] = await Promise.all(
      compareCommitsResponse.files.map(async (file: ValidFileObject) => {
        const fileName = file.filename;
        const fileContent = (await axios.get(file.raw_url)).data as string;
        const changedLines = getChangedFileLines(file.patch);

        return { fileName, fileContent, changedLines };
      })
    );
    console.log(reviewFiles);

    //Review Code
    //todo get user open-ai-api-key from dynamodb for this user.
    const openAiApiKey = "open-ai-api-key - get me from dynamodb";
    await review(args, reviewFiles, openAiApiKey);

    //Add review to github pull request
    //todo add review comment on Github pull request
  } catch (error) {
    console.log(error);
  }
};
