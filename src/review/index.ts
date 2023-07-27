import { commentOnPR } from "../common/ci/commentOnPR";
import { getMaxPromptLength } from "../common/model/getMaxPromptLength";
import { signOff } from "./constants";
import { askAI } from "./llm/askAI";
import { constructPromptsArray } from "./prompt/constructPrompt/constructPrompt";
import { getFileNames } from "./prompt/filesNames/getFileNames";

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
  const prompts = await constructPromptsArray(fileNames, maxPromptLength, isCi);

  const response = await askAI(prompts, modelName);

  if (isCi) {
    await commentOnPR(response, signOff);
  }
};
