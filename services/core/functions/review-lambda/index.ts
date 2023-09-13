import { APIGatewayProxyEvent } from "aws-lambda";

import { authenticate } from "./auth";
import {
  ReviewArgs,
  ReviewFile,
} from "../../../../code-review-gpt/src/common/types";
import { logger } from "../../../../code-review-gpt/src/common/utils/logger";
import { review } from "../../../../code-review-gpt/src/review/index";
import { GITHUB_SIGNATURE_HEADER_KEY } from "../../constants";
import { getVariableFromSSM } from "../utils/getVariable";

type ReviewLambdasBody = {
  args: ReviewArgs;
  files: ReviewFile[];
};

logger.settings.minLevel = 4;

type ReviewLambdaResponse = {
  statusCode: number;
  body: string | undefined;
};

export const main = async (
  event: APIGatewayProxyEvent
): Promise<ReviewLambdaResponse> => {
  if (event.body === null) {
    return {
      statusCode: 400,
      body: "The request does not contain a body as expected.",
    };
  }

  const header = event.headers[GITHUB_SIGNATURE_HEADER_KEY];
  if (header === undefined) {
    return {
      statusCode: 401,
      body: "No authentication token found.",
    };
  }

  const authenticated = await authenticate(header, event.body);
  if (!authenticated) {
    return {
      statusCode: 401,
      body: "Unauthorized.",
    };
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

    const inputBody = JSON.parse(event.body) as ReviewLambdasBody;
    const reviewResponse = await review(
      inputBody.args,
      inputBody.files,
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
