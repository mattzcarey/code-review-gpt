import { commentOnPR } from "../common/ci/commentOnPR";
import { getMaxPromptLength } from "../common/model/getMaxPromptLength";
import { commentPerFile } from "../common/ci/commentPerFile";
import { signOff } from "./constants";
import { askAI } from "./llm/askAI";
import { constructPromptsArray } from "./prompt/constructPrompt/constructPrompt";
import { File } from "../common/types";
import { filterFiles } from "./prompt/filterFiles";

interface ReviewArgs {
  [x: string]: unknown;
  ci: boolean;
  commentPerFile: boolean;
  debug: boolean;
  _: (string | number)[];
  $0: string;
}

export const review = async (yargs: ReviewArgs, files: File[]) => {
  const isCi = yargs.ci;
  const shouldCommentPerFile = yargs.commentPerFile;

  const modelName = yargs.model as string;

  const filteredFiles = filterFiles(files);

  const maxPromptLength = getMaxPromptLength(modelName);

  const prompts = await constructPromptsArray(filteredFiles, maxPromptLength);

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
