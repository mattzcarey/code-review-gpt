import yargs from "yargs";
import dotenv from "dotenv";

dotenv.config();

export const getYargs = () => {
  const argv = yargs
    .option("ci", {
      description: "Indicate that the script is running on a CI environment",
      type: "boolean",
      default: false,
    })
    .parseSync();

  return argv;
};

/* Env variables:
 * OPENAI_API_KEY
In CI:
 * GITHUB_SHA
 * BASE_SHA
 * GITHUB_TOKEN
 */

export const openAIApiKey = (): string => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set");
  }
  return process.env.OPENAI_API_KEY;
};

export const getGitHubEnvVariables = (): Record<string, string> => {
  const missingVars = ["GITHUB_SHA", "BASE_SHA", "GITHUB_TOKEN"].filter(
    (varName) => !process.env[varName]
  );
  if (missingVars.length > 0) {
    console.error(`Missing environment variables: ${missingVars.join(", ")}`);
    throw new Error("One or more GitHub environment variables are not set");
  }
  return {
    githubSha: process.env.GITHUB_SHA as string,
    baseSha: process.env.BASE_SHA as string,
    githubToken: process.env.GITHUB_TOKEN as string,
  };
};

export const gitCommand = (): string => {
  const argv = getYargs();
  if (argv.ci) {
    const { githubSha, baseSha } = getGitHubEnvVariables();
    return `git diff --name-only --diff-filter=ACMRT ${baseSha} ${githubSha}`;
  } else {
    return "git diff --name-only --diff-filter=ACMRT --cached";
  }
};
