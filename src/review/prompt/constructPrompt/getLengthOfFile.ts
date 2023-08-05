import { PromptFile } from "../../../common/types";

export const getLengthOfFile = (file: PromptFile): number =>
  file.fileName.length + file.promptContent.length;
