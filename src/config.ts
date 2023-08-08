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

export const getGitLabEnvVariables = (): Record<string, string> => {
  const missingVars = [
    "CI_MERGE_REQUEST_DIFF_BASE_SHA",
    "CI_PROJECT_ID",
    "CI_MERGE_REQUEST_IID",
    "CI_COMMIT_SHA",
    "GITLAB_TOKEN",
  ].filter((varName) => !process.env[varName]);
  if (missingVars.length > 0) {
    logger.error(`Missing environment variables: ${missingVars.join(", ")}`);
    throw new Error("One or more GitLab environment variables are not set. Did you set up your Gitlab access token? Refer to the README (Gitlab CI section) on how to set it up.");
  }
  return {
    mergeRequestBaseSha: process.env.CI_MERGE_REQUEST_DIFF_BASE_SHA as string,
    gitlabSha: process.env.CI_COMMIT_SHA as string,
    gitlabToken: process.env.GITLAB_TOKEN as string,
    projectId: process.env.CI_PROJECT_ID as string,
    mergeRequestIIdString: process.env.CI_MERGE_REQUEST_IID as string,
  };
};
