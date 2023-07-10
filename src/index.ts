import dotenv from "dotenv";
import { getFileNames } from "./getFileNames";
import { constructPromptsArray } from "./constructPrompt";
import { askAI } from "./askAI";
import { getYargs } from "./args";
import { commentOnPR } from "./commentOnPR";

dotenv.config();
const argv = getYargs();

const main = async () => {
  const fileNames = await getFileNames();
  const prompts = await constructPromptsArray(fileNames);
  const response = await askAI(prompts);

  if (argv.ci) {
    await commentOnPR(response);
  }
};

main().catch((error) => {
  console.error(`Error: ${error}`);
  process.exit(1);
});
