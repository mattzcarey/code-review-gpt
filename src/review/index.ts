import { commentOnPR } from "./ci/commentOnPR";
import { askAI } from "./llm/askAI";
import { constructPromptsArray } from "./prompt/constructPrompt";
import { getFileNames } from "./prompt/getFileNames";
import { getMaxPromptLength } from "../model/getMaxPromptLength";

interface ReviewArgs {
  [x: string]: unknown;
  ci: boolean;
  _: (string | number)[];
  $0: string;
}

export const review = async (yargs: ReviewArgs) => {
  const isCi = yargs.ci;
  const modelName = yargs.model as string;

  const maxPromptLength = getMaxPromptLength(modelName);

  const fileNames = await getFileNames(isCi);
  const prompts = await constructPromptsArray(fileNames, maxPromptLength);

  const response = await askAI(prompts, modelName);

  if (isCi) {
    await commentOnPR(response);
  }
};
