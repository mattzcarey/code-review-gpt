import { review } from "../../../../src/review/index";
import { ReviewArgs, ReviewFile } from "../../../../src/common/types";
import { getOpenAiApiEnvVariable } from "./helpers";
import { APIGatewayProxyEvent } from "aws-lambda";

interface ReviewLambdasBody {
  args: ReviewArgs;
  files: ReviewFile[];
}

export const main = async (event: APIGatewayProxyEvent) => {
  if (process.env.OPENAI_API_KEY_PARAM_NAME === undefined) {
    throw new Error(
      "OPENAI_API_KEY_PARAM_NAME environment variable is not set."
    );
  }
  if (event.body === null) {
    return Promise.resolve({
      statusCode: 400,
      body: "The request does not contain a body as expected.",
    });
  }

  try {
    const inputBody = JSON.parse(event.body) as ReviewLambdasBody;
    console.log(inputBody);
    const keyValue = await getOpenAiApiEnvVariable(
      process.env.OPENAI_API_KEY_PARAM_NAME
    );

    process.env["OPENAI_API_KEY"] = keyValue;
    const reviewResponse = await review(inputBody.args, inputBody.files);
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
