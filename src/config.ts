/* Env variables:
 * OPENAI_API_KEY
In CI:
 * GITHUB_SHA
 * BASE_SHA
 * GITHUB_TOKEN
 */

import { logger } from "./common/utils/logger";

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
    logger.error(`Missing environment variables: ${missingVars.join(", ")}`);
    throw new Error("One or more GitHub environment variables are not set");
  }
  return {
    githubSha: process.env.GITHUB_SHA as string,
    baseSha: process.env.BASE_SHA as string,
    githubToken: process.env.GITHUB_TOKEN as string,
  };
};
