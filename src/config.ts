import { logger } from "./common/utils/logger"

export const getOpenAIApiKey = (): string => {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    logger.error("OPENAI_API_KEY is not set")
    throw new Error("OPENAI_API_KEY is not set")
  }

  return apiKey
}

export const githubToken = (): string => {
  const token = process.env.GITHUB_TOKEN
  if (!token) {
    logger.error("GITHUB_TOKEN is not set")
    throw new Error("GITHUB_TOKEN is not set")
  }

  return token
}

interface GitHubEnvVariables {
  githubSha: string
  baseSha: string
  githubToken: string
}

export const getGitHubEnvVariables = (): GitHubEnvVariables => {
  const envVars = ["GITHUB_SHA", "BASE_SHA", "GITHUB_TOKEN"] as const
  const missingVars = envVars.filter(envVar => !process.env[envVar])

  if (missingVars.length > 0) {
    logger.error(`Missing environment variables: ${missingVars.join(", ")}`)
    throw new Error("One or more GitHub environment variables are not set")
  }

  return {
    githubSha: process.env.GITHUB_SHA,
    baseSha: process.env.BASE_SHA,
    githubToken: process.env.GITHUB_TOKEN
  } as GitHubEnvVariables
}

interface GitLabEnvVariables {
  mergeRequestBaseSha: string
  gitlabSha: string
  gitlabToken: string
  projectId: string
  mergeRequestIIdString: string
  gitlabHost: string
}

export const getGitLabEnvVariables = (): GitLabEnvVariables => {
  const requiredVars = [
    "CI_MERGE_REQUEST_DIFF_BASE_SHA",
    "CI_PROJECT_ID",
    "CI_MERGE_REQUEST_IID",
    "CI_COMMIT_SHA",
    "GITLAB_TOKEN",
    "GITLAB_HOST"
  ] as const

  const missingVars = requiredVars.filter(varName => !process.env[varName])

  if (missingVars.length > 0) {
    logger.error(`Missing environment variables: ${missingVars.join(", ")}`)
    throw new Error(
      "One or more GitLab environment variables are not set. Did you set up your Gitlab access token? Refer to the README (Gitlab CI section) on how to set it up."
    )
  }

  return {
    mergeRequestBaseSha: process.env.CI_MERGE_REQUEST_DIFF_BASE_SHA,
    gitlabSha: process.env.CI_COMMIT_SHA,
    gitlabToken: process.env.GITLAB_TOKEN,
    projectId: process.env.CI_PROJECT_ID,
    mergeRequestIIdString: process.env.CI_MERGE_REQUEST_IID,
    gitlabHost: process.env.GITLAB_HOST || "https://gitlab.com"
  } as GitLabEnvVariables
}

interface AzureDevOpsEnvVariables {
  azdevSha: string
  baseSha: string
  azdevToken: string
}

export const gitAzdevEnvVariables = (): AzureDevOpsEnvVariables => {
  const envVars = ["SYSTEM_PULLREQUEST_SOURCECOMMITID", "BASE_SHA", "API_TOKEN"] as const
  const missingVars = envVars.filter(envVar => !process.env[envVar])

  if (missingVars.length > 0) {
    logger.error(`Missing environment variables: ${missingVars.join(", ")}`)
    throw new Error("One or more Azure DevOps environment variables are not set")
  }

  return {
    azdevSha: process.env.SYSTEM_PULLREQUEST_SOURCECOMMITID,
    baseSha: process.env.BASE_SHA,
    azdevToken: process.env.API_TOKEN
  } as AzureDevOpsEnvVariables
}
