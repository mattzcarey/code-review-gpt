/* Env variables:
 * OPENAI_API_KEY
In CI:
 * GITHUB_SHA
 * BASE_SHA
 * GITHUB_TOKEN
 */

import { logger } from "./common/utils/logger";

export const getOpenAIApiKey = (): string => {
  if (!process.env.OPENAI_API_KEY) {
    logger.error("OPENAI_API_KEY is not set");
  }

  return process.env.OPENAI_API_KEY ?? "";
};

export const githubToken = (): string => {
  if (!process.env.GITHUB_TOKEN) {
    logger.error("GITHUB_TOKEN is not set");
  }

  return process.env.GITHUB_TOKEN ?? "";
};

export const getGitHubEnvVariables = (): Record<string, string> => {
  const envVars = ["GITHUB_SHA", "BASE_SHA", "GITHUB_TOKEN"];
  const missingVars: string[] = [];
  envVars.forEach((envVar) => process.env[envVar] ?? missingVars.push(envVar));

  if (missingVars.length > 0) {
    logger.error(`Missing environment variables: ${missingVars.join(", ")}`);
    throw new Error("One or more GitHub environment variables are not set");
  }

  return {
    githubSha: process.env.GITHUB_SHA ?? "",
    baseSha: process.env.BASE_SHA ?? "",
    githubToken: process.env.GITHUB_TOKEN ?? "",
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
    throw new Error(
      "One or more GitLab environment variables are not set. Did you set up your Gitlab access token? Refer to the README (Gitlab CI section) on how to set it up."
    );
  }

  return {
    mergeRequestBaseSha: process.env.CI_MERGE_REQUEST_DIFF_BASE_SHA ?? "",
    gitlabSha: process.env.CI_COMMIT_SHA ?? "",
    gitlabToken: process.env.GITLAB_TOKEN ?? "",
    projectId: process.env.CI_PROJECT_ID ?? "",
    mergeRequestIIdString: process.env.CI_MERGE_REQUEST_IID ?? "",
  };
};

export const getAzureDevOpsEnvVariables = (): Record<string, string> => {
  const missingVars = [
    "AZURE_DEVOPS_PROJECT_ID",         // ID del proyecto en Azure DevOps
    "AZURE_DEVOPS_REPOSITORY_NAME",    // Nombre del repositorio en Azure DevOps
    "AZURE_DEVOPS_PAT",                // Token de Acceso Personal (PAT) de Azure DevOps
    "AZURE_DEVOPS_COMMIT_SHA",         // SHA de la confirmación actual
  ].filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    logger.error(`Missing environment variables: ${missingVars.join(", ")}`);
    throw new Error(
      "One or more Azure DevOps environment variables are not set. Did you set up your Azure DevOps PAT and project details?"
    );
  }

  return {
    projectId: process.env.AZURE_DEVOPS_PROJECT_ID ?? "",
    repositoryName: process.env.AZURE_DEVOPS_REPOSITORY_NAME ?? "",
    azureDevOpsPat: process.env.AZURE_DEVOPS_PAT ?? "",
    commitSha: process.env.AZURE_DEVOPS_COMMIT_SHA ?? "",
  };
};


