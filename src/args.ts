import yargs from "yargs";
import dotenv from "dotenv";

dotenv.config();

const argv = yargs
  .option("ci", {
    description: "Indicate that the script is running on a CI environment",
    type: "boolean",
    default: false,
  })
  .option("base_sha", {
    description: "Base SHA",
    type: "string",
    default: undefined,
  })
  .option("github_sha", {
    description: "GitHub SHA",
    type: "string",
    default: undefined,
  })
  .option("openai_api_key", {
    description: "OpenAI API key",
    type: "string",
    default: undefined,
  })
  .parseSync();

export const gitCommand = (): string => {
  if (argv.ci) {
    return `git diff --name-only --diff-filter=ACMRT ${argv.base_sha} ${argv.github_sha}`;
  } else {
    return "git diff --name-only --diff-filter=ACMRT --cached";
  }
};

export const openAIApiKey = (): string => {
  if (argv.openai_api_key) {
    return argv.openai_api_key;
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key not found");
  }

  return process.env.OPENAI_API_KEY;
};
