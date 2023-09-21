import { EventBridgeEvent } from "aws-lambda";

import {
  ReviewArgs,
  ReviewFile,
} from "../../../../code-review-gpt/src/common/types";
import { logger } from "../../../../code-review-gpt/src/common/utils/logger";
import { review } from "../../../../code-review-gpt/src/review/index";
import { getVariableFromSSM } from "../utils/getVariable";

type ReviewLambdaBody = {
  args: ReviewArgs;
  files: ReviewFile[];
};

logger.settings.minLevel = 4;

type ReviewLambdaResponse = {
  statusCode: number;
  body: string | undefined;
};

type ReviewEvent = EventBridgeEvent<'WebhookRequestEvent', ReviewLambdaBody>;


export const main = async (event: ReviewEvent): Promise<ReviewLambdaResponse> => {
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

    const reviewResponse = await review(
      event.detail.args,
      event.detail.files,
      openAIApiKey
    );

    return {
      statusCode: 200,
      body: reviewResponse,
    };
  } catch (err) {
    console.error(err);

    return {
      statusCode: 500,
      body: "Error when reviewing code.",
    };
  }
};
