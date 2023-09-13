import { S3Client } from "@aws-sdk/client-s3";
import { APIGatewayProxyEvent } from "aws-lambda";
import { v4 as uuidv4 } from "uuid";

import { saveInputAndResponseToS3 } from "./saveInputAndResponseToS3";
import { getMaxPromptLength } from "../../../../code-review-gpt/src/common/model/getMaxPromptLength";
import { logger } from "../../../../code-review-gpt/src/common/utils/logger";
import { askAI } from "../../../../code-review-gpt/src/review/llm/askAI";
import { demoPrompt } from "../../../../code-review-gpt/src/review/prompt/prompts";
import { ReviewDemoCounterEntity } from "../../entities";
import { formatResponse } from "../utils/format-response";
import { getEnvVariable, getVariableFromSSM } from "../utils/getVariable";

const DEFAULT_DEMO_MODEL = "gpt-3.5-turbo";

const DEFAULT_ORGANISATION = undefined;

logger.settings.minLevel = 4;

const BUCKET_NAME = getEnvVariable("BUCKET_NAME");

const s3Client = new S3Client({});

type DemoReviewLambdaResponse = {
  statusCode: number;
  body: string | undefined;
};

type ReviewLambdaInput = {
  code: string;
};

const isReviewLambdaInput = (input: unknown): input is ReviewLambdaInput =>
  typeof input === "object" && input !== null && "code" in input;

export const main = async (
  event: APIGatewayProxyEvent
): Promise<DemoReviewLambdaResponse> => {
  const demoReviewId = uuidv4();

  if (event.body === null) {
    return formatResponse(
      "The request does not contain a body as expected.",
      400
    );
  }

  try {
    const openAIApiKey = await getVariableFromSSM(
      process.env.OPENAI_API_KEY_PARAM_NAME ?? ""
    );

    process.env.LANGCHAIN_API_KEY = await getVariableFromSSM(
      process.env.LANGCHAIN_API_KEY_PARAM_NAME ?? ""
    );

    const inputBody: unknown = JSON.parse(event.body);

    if (!isReviewLambdaInput(inputBody)) {
      return formatResponse(
        "The request body does not contain the expected data.",
        400
      );
    }

    await ReviewDemoCounterEntity.update({
      dailyCount: { $add: 1 },
    });

    const maxPromptLength = getMaxPromptLength(DEFAULT_DEMO_MODEL);
    const prompt = demoPrompt + inputBody.code;

    if (prompt.length > maxPromptLength) {
      return formatResponse(
        `The provided code is too large for the model ${DEFAULT_DEMO_MODEL}. Please try and provide a smaller code snippet.`,
        400
      );
    }

    const { markdownReport } = await askAI(
      [prompt],
      DEFAULT_DEMO_MODEL,
      openAIApiKey,
      DEFAULT_ORGANISATION
    );

    await saveInputAndResponseToS3(
      BUCKET_NAME,
      s3Client,
      demoReviewId,
      prompt,
      markdownReport
    );

    return formatResponse(markdownReport, 200);
  } catch (err) {
    console.error(err);

    return formatResponse("Error when reviewing code.", 500);
  }
};
