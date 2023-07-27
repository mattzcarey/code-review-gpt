import { commentOnPR } from "../common/ci/commentOnPR";
import { getMaxPromptLength } from "../common/model/getMaxPromptLength";
import { commentPerFile } from "../common/ci/commentPerFile";
import { signOff } from "./constants";
import { askAI } from "./llm/askAI";
import { constructPromptsArray } from "./prompt/constructPrompt/constructPrompt";
import { getFileNames } from "./prompt/filesNames/getFileNames";

interface ReviewArgs {
  [x: string]: unknown;
  ci: boolean;
  commentPerFile: boolean;
  _: (string | number)[];
  $0: string;
}

export const review = async (yargs: ReviewArgs) => {
  const isCi = yargs.ci;
  const shouldCommentPerFile = yargs.commentPerFile;

  const modelName = yargs.model as string;

  const maxPromptLength = getMaxPromptLength(modelName);

  const fileNames = await getFileNames(isCi);
  const prompts = await constructPromptsArray(fileNames, maxPromptLength, isCi);

  const { markdownReport: response, feedbacks } = await askAI(
    prompts,
    modelName
  );

  if (isCi && !shouldCommentPerFile) {
    await commentOnPR(response, signOff);
  }
  if (isCi && shouldCommentPerFile) {
    await commentPerFile(feedbacks, signOff);
  }
};
