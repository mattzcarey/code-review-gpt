import dotenv from "dotenv";
import { getFileNames } from "./getFileNames";
import { constructPromptsArray } from "./constructPrompt";
import { askAI } from "./askAI";
import { getYargs } from "./args";
import { commentOnPR } from "./commentOnPR";

dotenv.config();
const argv = getYargs();

const main = async () => {
  try {
    const fileNames = await getFileNames();
    const prompts = await constructPromptsArray(fileNames);
    const response = await askAI(prompts);

    if (argv.ci) {
      await commentOnPR(response);
    }
  } catch (error) {
    console.error(`Error: ${JSON.stringify(error)}`);
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
