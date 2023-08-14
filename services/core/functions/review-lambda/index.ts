import { review } from "../../../../src/review/index";
import { ReviewArgs, ReviewFile } from "../../../../src/common/types";
import { APIGatewayProxyEvent } from "aws-lambda";
import { getVariableFromSSM } from "../helpers/getVariable";
import { logger } from "../../../../src/common/utils/logger";
import { authenticate } from "./auth";
import { GITHUB_SIGNATURE_HEADER_KEY } from "../../constants";

interface ReviewLambdasBody {
  args: ReviewArgs;
  files: ReviewFile[];
}

logger.settings.minLevel = 4;

export const main = async (event: APIGatewayProxyEvent) => {
  if (event.body === null) {
    return Promise.resolve({
      statusCode: 400,
      body: "The request does not contain a body as expected.",
    });
  }

  const header = event.headers[GITHUB_SIGNATURE_HEADER_KEY];
  if (header === undefined) {
    return Promise.resolve({
      statusCode: 401,
      body: "No authentication token found.",
    });
  }

  const authenticated = await authenticate(header, event.body);
  if (!authenticated) {
    return Promise.resolve({
      statusCode: 401,
      body: "Unauthorized.",
    });
  }

  const openAIApiKey = await getVariableFromSSM(
    process.env.OPENAI_API_KEY_PARAM_NAME ?? ""
  );

  process.env.LANGCHAIN_API_KEY = await getVariableFromSSM(
    process.env.LANGCHAIN_API_KEY_PARAM_NAME ?? ""
  );

  try {
    const inputBody = JSON.parse(event.body) as ReviewLambdasBody;
    const reviewResponse = await review(
      inputBody.args,
      inputBody.files,
      openAIApiKey
    );
    return Promise.resolve({
      statusCode: 200,
      body: reviewResponse,
    });
  } catch (err) {
    console.error(err);

    return Promise.resolve({
      statusCode: 500,
      body: "Error when reviewing code.",
    });
  }
};
