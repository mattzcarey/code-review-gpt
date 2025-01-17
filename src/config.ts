/* Env variables:
 * OPENAI_API_KEY
In CI:
 * GITHUB_SHA
 * BASE_SHA
 * GITHUB_TOKEN
 */

import { logger } from './common/utils/logger';

export const getOpenAIApiKey = (): string => {
  const openAiApiKey = process.env.OPENAI_API_KEY;
  const azureOpenAiApiKey = process.env.AZURE_OPENAI_API_KEY;

  if (!openAiApiKey && !azureOpenAiApiKey) {
    logger.error('Neither OPENAI_API_KEY nor AZURE_OPENAI_API_KEY is set');
  }

  return openAiApiKey ?? azureOpenAiApiKey ?? '';
};

export const githubToken = (): string => {
  if (!process.env.GITHUB_TOKEN) {
    logger.error('GITHUB_TOKEN is not set');
  }

  return process.env.GITHUB_TOKEN ?? '';
};

export const getGitHubEnvVariables = (): Record<string, string> => {
  const envVars = ['GITHUB_SHA', 'BASE_SHA', 'GITHUB_TOKEN'];
  const missingVars: string[] = [];

  for (const envVar of envVars) {
    if (!process.env[envVar]) {
      missingVars.push(envVar);
    }
  }

  if (missingVars.length > 0) {
    logger.error(`Missing environment variables: ${missingVars.join(', ')}`);
    throw new Error('One or more GitHub environment variables are not set');
  }

  return {
    githubSha: process.env.GITHUB_SHA ?? '',
    baseSha: process.env.BASE_SHA ?? '',
    githubToken: process.env.GITHUB_TOKEN ?? '',
  };
};

export const getGitLabEnvVariables = (): Record<string, string> => {
  const missingVars = [
    'CI_MERGE_REQUEST_DIFF_BASE_SHA',
    'CI_PROJECT_ID',
    'CI_MERGE_REQUEST_IID',
    'CI_COMMIT_SHA',
    'GITLAB_TOKEN',
    'GITLAB_HOST',
  ].filter((varName) => !process.env[varName]);
  if (missingVars.length > 0) {
    logger.error(`Missing environment variables: ${missingVars.join(', ')}`);
    throw new Error(
      'One or more GitLab environment variables are not set. Did you set up your Gitlab access token? Refer to the README (Gitlab CI section) on how to set it up.'
    );
  }

  return {
    mergeRequestBaseSha: process.env.CI_MERGE_REQUEST_DIFF_BASE_SHA ?? '',
    gitlabSha: process.env.CI_COMMIT_SHA ?? '',
    gitlabToken: process.env.GITLAB_TOKEN ?? '',
    projectId: process.env.CI_PROJECT_ID ?? '',
    mergeRequestIIdString: process.env.CI_MERGE_REQUEST_IID ?? '',
    gitlabHost: process.env.GITLAB_HOST ?? 'https://gitlab.com',
  };
};

export const gitAzdevEnvVariables = (): Record<string, string> => {
  const envVars = ['SYSTEM_PULLREQUEST_SOURCECOMMITID', 'BASE_SHA', 'API_TOKEN'];
  const missingVars: string[] = [];

  for (const envVar of envVars) {
    if (!process.env[envVar]) {
      missingVars.push(envVar);
    }
  }

  if (missingVars.length > 0) {
    logger.error(`Missing environment variables: ${missingVars.join(', ')}`);
    throw new Error('One or more Azure DevOps environment variables are not set');
  }

  return {
    azdevSha: process.env.SYSTEM_PULLREQUEST_SOURCECOMMITID ?? '',
    baseSha: process.env.BASE_SHA ?? '',
    azdevToken: process.env.API_TOKEN ?? '',
  };
};
