import { review } from "../../../../src/review/index";
import { ReviewArgs, ReviewFile } from "../../../../src/common/types";
import { getOpenAiApiEnvVariable } from "../helpers";

interface ReviewLambdasBody {
  args: ReviewArgs;
  files: ReviewFile[];
}

export const main = async (event: ReviewLambdasBody) => {
  process.env["OPENAI_API_KEY"] = await getOpenAiApiEnvVariable(
    process.env.OPENAI_API_KEY_PARAM_NAME ?? ""
  );

  if (event === null) {
    throw new Error("Request body is null");
  }

  return await review(event.args, event.files);
};
