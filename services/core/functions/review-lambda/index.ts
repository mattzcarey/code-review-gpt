import { review } from "../../../../src/review/index";
import { ReviewArgs, ReviewFile } from "../../../../src/common/types";
import { getOpenAiApiEnvVariable } from "./helpers";

interface ReviewLambdasBody {
  args: ReviewArgs;
  files: ReviewFile[];
}

export const main = async (event: ReviewLambdasBody) => {
  if (process.env.OPENAI_API_KEY_PARAM_NAME === undefined) {
    throw new Error(
      "OPENAI_API_KEY_PARAM_NAME environment variable is not set."
    );
  }
  if (event === null) {
    throw new Error("Request body is null");
  }
  const keyValue = await getOpenAiApiEnvVariable(
    process.env.OPENAI_API_KEY_PARAM_NAME
  );

  process.env["OPENAI_API_KEY"] = keyValue;
  return await review(event.args, event.files);
};
