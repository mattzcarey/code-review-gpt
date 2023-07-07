import dotenv from "dotenv";
import { getFileNames } from "./getFileNames";
import { constructPromptsArray } from "./constructPrompt";
import { askAI } from "./askAI";

dotenv.config();

const main = async () => {
  const fileNames = await getFileNames();
  const prompts = await constructPromptsArray(fileNames);
  await askAI(prompts);
};

main();
