import { getOpenAiApiEnvVariable } from "../helpers";
import { APIGatewayProxyEvent } from "aws-lambda";
import { askAI } from "../../../../src/review/llm/askAI";
import { getMaxPromptLength } from "../../../../src/common/model/getMaxPromptLength";
import { demoPrompt } from "../../../../src/review/prompt/prompts";
import { logger } from "../../../../src/common/utils/logger";

interface ReviewLambdaInput {
  code: string;
}

const DEMO_MODEL = "gpt-4";

logger.settings.minLevel = 4;

export const main = async (event: APIGatewayProxyEvent) => {
  if (event.body == null) {
    return Promise.resolve({
      statusCode: 400,
      body: "The request does not contain a body as expected.",
    });
  }

  try {
    const openAIApiKey = await getOpenAiApiEnvVariable(
      process.env.OPENAI_API_KEY_PARAM_NAME ?? ""
    );

    const inputBody = JSON.parse(event.body) as ReviewLambdaInput;
    const code = inputBody.code;

    if (code === undefined) {
      return Promise.resolve({
        statusCode: 400,
        body: "The request body does not contain the expected data.",
      });
    }

    const maxPromptLength = getMaxPromptLength(DEMO_MODEL);
    const prompt = demoPrompt + code;

    if (prompt.length > maxPromptLength) {
      return Promise.resolve({
        statusCode: 400,
        body: `The provided code is too large for the model ${DEMO_MODEL}. Please try and provide a smaller code snippet.`,
      });
    }

    const { markdownReport } = await askAI([prompt], DEMO_MODEL, openAIApiKey);

    return Promise.resolve({
      statusCode: 200,
      body: markdownReport,
    });
  } catch (err) {
    console.error(err);

    return Promise.resolve({
      statusCode: 500,
      body: "Error when reviewing code.",
    });
  }
};
