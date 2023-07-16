import { Argv } from "yargs";
import { askAI } from "./askAI";
import { commentOnPR } from "./commentOnPR";
import { constructPromptsArray } from "./constructPrompt";
import { getFileNames } from "./getFileNames";

interface ReviewArgs {
  [x: string]: unknown;
  ci: boolean;
  _: (string | number)[];
  $0: string;
}

export const review = async (yargs: ReviewArgs) => {
  const isCi = yargs.ci;

  const fileNames = await getFileNames(isCi);
  const prompts = await constructPromptsArray(fileNames);
  const response = await askAI(prompts);

  if (isCi) {
    await commentOnPR(response);
  }
};
