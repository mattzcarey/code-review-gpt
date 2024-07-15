import azdev from "azure-devops-node-api";
import * as gitApiObject from "azure-devops-node-api/GitApi.js";
import * as GitInterfaces from "azure-devops-node-api/interfaces/GitInterfaces.js";
import { logger } from "../../utils/logger";

interface GitAzdevEnvVariables {
  serverUrl: string;
  azdevToken: string;
  pullRequestId: string;
  project: string;
  repositoryId: string;
}

const gitAzdevEnvVariables = (): GitAzdevEnvVariables => {
  const requiredEnvVars: Record<keyof GitAzdevEnvVariables, string> = {
    serverUrl: "SYSTEM_TEAMFOUNDATIONCOLLECTIONURI",
    azdevToken: "API_TOKEN",
    pullRequestId: "SYSTEM_PULLREQUEST_PULLREQUESTID",
    project: "SYSTEM_TEAMPROJECTID",
    repositoryId: "BUILD_REPOSITORY_ID",
  };

  const missingVars = Object.entries(requiredEnvVars)
    .filter(([_, envVar]) => !process.env[envVar])
    .map(([key, _]) => key);

  if (missingVars.length > 0) {
    logger.error(`Missing environment variables: ${missingVars.join(", ")}`);
    throw new Error(
      "One or more Azure DevOps environment variables are not set"
    );
  }

  return Object.fromEntries(
    Object.entries(requiredEnvVars).map(([key, envVar]) => [
      key,
      process.env[envVar]!,
    ])
  ) as unknown as GitAzdevEnvVariables;
};

/**
 * Publish a comment on the pull request. It always create a new one.
 * The comment will be signed off with the provided sign off.
 * @param comment The body of the comment to publish.
 * @param signOff The sign off to use.
 * @returns
 */
export const commentOnPR = async (
  comment: string,
  signOff: string
): Promise<void> => {
  try {
    const { serverUrl, azdevToken, pullRequestId, repositoryId, project } =
      gitAzdevEnvVariables();

    const pullRequestIdNumber = Number(pullRequestId);

    const authHandler = azdev.getPersonalAccessTokenHandler(azdevToken);
    const connection: azdev.WebApi = new azdev.WebApi(serverUrl, authHandler);

    const git: gitApiObject.IGitApi = await connection.getGitApi();

    const commentThread = <GitInterfaces.GitPullRequestCommentThread>{
      comments: [
        <GitInterfaces.Comment>{
          content: `${comment}\n\n---\n\n${signOff}`,
        },
      ],
    };

    await git.createThread(
      commentThread,
      repositoryId,
      pullRequestIdNumber,
      project
    );
  } catch (error) {
    logger.error(`Failed to comment on PR: ${JSON.stringify(error)}`);
    throw error;
  }
};
