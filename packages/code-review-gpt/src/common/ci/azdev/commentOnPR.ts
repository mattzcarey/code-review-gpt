import * as azdev from "azure-devops-node-api";
import * as gitApiObject from "azure-devops-node-api/GitApi";
import * as GitInterfaces from "azure-devops-node-api/interfaces/GitInterfaces";
import { logger } from "../../utils/logger";

const gitAzdevEnvVariables = (): Record<string, string> => {
  const envVars = [
    "SYSTEM_TEAMFOUNDATIONCOLLECTIONURI",
    "API_TOKEN",
    "SYSTEM_PULLREQUEST_PULLREQUESTID",
    "BUILD_REPOSITORY_ID",
    "SYSTEM_TEAMPROJECTID",
  ];
  const missingVars: string[] = [];
  envVars.forEach((envVar) => process.env[envVar] ?? missingVars.push(envVar));

  if (missingVars.length > 0) {
    logger.error(`Missing environment variables: ${missingVars.join(", ")}`);
    throw new Error(
      "One or more Azure DevOps environment variables are not set"
    );
  }

  return {
    serverUrl: process.env.SYSTEM_TEAMFOUNDATIONCOLLECTIONURI ?? "",
    azdevToken: process.env.API_TOKEN ?? "",
    pullRequestId: process.env.SYSTEM_PULLREQUEST_PULLREQUESTID ?? "",
    project: process.env.SYSTEM_TEAMPROJECTID ?? "",
    repositoryId: process.env.BUILD_REPOSITORY_ID ?? "",
  };
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
      comments: [<GitInterfaces.Comment>{
        content: `${comment}\n\n---\n\n${signOff}`
      }]
    };

    await git.createThread(commentThread, repositoryId, pullRequestIdNumber, project);

  } catch (error) {
    logger.error(`Failed to comment on PR: ${JSON.stringify(error)}`);
    throw error;    
  }
};
