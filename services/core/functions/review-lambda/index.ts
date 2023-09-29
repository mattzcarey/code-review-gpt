import axios from "axios";

import { review } from "../../../../code-review-gpt/src/review";
import { OPENAI_API_KEY_PARAM_NAME } from "../../constants";
import { getVariableFromSSM } from "../utils/getVariable";
import {
  ReviewEvent,
  ReviewFile,
  ValidFileObject,
  isValidEventDetail,
} from "../utils/types";
import {
  getChangedFileLines,
  getCompareCommitsResponse,
  getInstallationAccessToken,
  postReviewComment,
} from "./utils";

export const main = async (event: ReviewEvent): Promise<void> => {
  const eventDetail = event.detail;

  if (!isValidEventDetail(eventDetail)) {
    throw new Error(
      "Error fetching event in review-lambda event is of an unexpected shape"
    );
  }

  process.env.LANGCHAIN_API_KEY = await getVariableFromSSM(
    process.env.LANGCHAIN_API_KEY_PARAM_NAME ?? ""
  );

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
    const args = {
      model: "gpt-3.5-turbo",
      reviewType: "changed",
      setupTarget: "github",
      ci: undefined,
      org: undefined,
      commentPerFile: false,
      remote: undefined,
      provider: "openai",
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

    //Review Code
    //todo get user open-ai-api-key from dynamodb for this user.
    // The following can be used once the key is retrieved from user data in DynamoDB
    // Which will contain an encrypted key
    // const openAIKey = await decryptKey(userEncrypedKey);

    const openAiApiKey = await getVariableFromSSM(OPENAI_API_KEY_PARAM_NAME);
    const reviewComment = await review(args, reviewFiles, openAiApiKey);

    if (reviewComment === undefined) {
      console.log("No review comment to post");

      return;
    }

    //Add review to github pull request
    await postReviewComment(
      reviewComment,
      installationAccessToken,
      eventDetail
    );
  } catch (error) {
    console.log(error);
  }
};
