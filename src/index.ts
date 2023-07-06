import dotenv from "dotenv";
import { getFileNames } from "./getFileNames";
import { constructPrompt } from "./constructPrompt";
import { askAI } from "./askAI";

dotenv.config();

const main = async () => {
  const fileNames = await getFileNames();
  const prompt = await constructPrompt(fileNames);
  const response = await askAI(prompt);
  console.log(response);
};

main();
