import { askAI } from "./llm/askAI";
import { constructPromptsArray } from "./prompt/constructPrompt";
import { getFileNames } from "./prompt/getFileNames";
import { getMaxPromptLength } from "../common/model/getMaxPromptLength";
import { commentOnPR } from "../common/ci/commentOnPR";
import { commentOnPRFiles } from "../common/ci/commentOnPRFiles";
import { signOff } from "./constants";

interface ReviewArgs {
  [x: string]: unknown;
  ci: boolean;
  _: (string | number)[];
  $0: string;
}

export const review = async (yargs: ReviewArgs) => {
  const isCi = yargs.ci;
  const isLineByLine = yargs.ci; //todo create actual var
  const modelName = yargs.model as string;

  const maxPromptLength = getMaxPromptLength(modelName);

  const fileNames = await getFileNames(isCi);
  const prompts = await constructPromptsArray(fileNames, maxPromptLength);

  const {markdownReport: response, feedbacks} = await askAI(prompts, modelName);

  if (isCi) {
    await commentOnPR(response, signOff);
    if (isLineByLine) {
      await commentOnPRFiles(feedbacks);
    }
  }
};
