/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { EventBridgeEvent } from "aws-lambda";

import { review } from "../../../../code-review-gpt/src/review/index";
import { getFilesWithChanges } from "../utils/getReviewFiles";
import { getVariableFromSSM } from "../utils/getVariable";
type ReviewEvent = EventBridgeEvent<"WebhookRequestEvent", string>;

export const main = async (event: ReviewEvent): Promise<void> => {
  event.detail;

  const pr = JSON.parse(event.detail)["pull_request"];
  console.log(pr["head"]["sha"]); //the most recent commit sha
  console.log(pr["base"]["sha"]); //the commit sha of most recent on main

  // Get/Set args (future work make args configurable)
  const args = {
    model: "gpt-3.5",
    reviewType: "changed",
    setupTarget: "github",
    ci: undefined,
    org: undefined,
    commentPerFile: false,
    remote: undefined,
    _: [],
    $0: ""
  };

  // Get files
  console.log(`Get files with changes, base: ${pr["base"]["sha"]}, head ${pr["head"]["sha"]}`)
  const reviewFiles = await getFilesWithChanges(
    pr["base"]["sha"],
    pr["head"]["sha"]
  );

  if (reviewFiles === undefined) {
    console.log("No files with changes found.");

    return;
  }

  try {
    // Use the same OpenAI key for everyone for now
    const openAIApiKey = await getVariableFromSSM(
      process.env.OPENAI_API_KEY_PARAM_NAME ?? ""
    );

    // The following can be used once the key is retrieved from user data in DynamoDB
    // Which will contain an encrypted key
    // const openAIKey = await decryptKey(userEncrypedKey);

    process.env.LANGCHAIN_API_KEY = await getVariableFromSSM(
      process.env.LANGCHAIN_API_KEY_PARAM_NAME ?? ""
    );

    const reviewResponse = await review(args, reviewFiles, openAIApiKey);
    // add review response to github.

    console.log("Code Successfully Reviewed", reviewResponse);

    return;
  } catch (err) {
    console.error(err);

    return;
  }
};
