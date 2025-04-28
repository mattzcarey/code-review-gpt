import { context, getOctokit } from '@actions/github';
import type { GitHub } from '@actions/github/lib/utils'; // Import GitHub type
import { getGitHubEnvVariables } from '../../../config'; // Assume this path is correct
import { logger } from '../../utils/logger';
import type { PlatformProvider, ReviewComment, ThreadComment } from '../provider';

const getToken = (): string => {
  const { githubToken } = getGitHubEnvVariables();
  if (!githubToken) {
    throw new Error('GITHUB_TOKEN is not set');
  }
  return githubToken;
};

interface OctokitRepoDetails {
  octokit: InstanceType<typeof GitHub>;
  owner: string;
  repo: string;
  pull_number: number;
}

const getOctokitRepoDetails = (): OctokitRepoDetails | undefined => {
  try {
    const githubToken = getToken();
    const { payload, issue } = context;

    if (!payload.pull_request) {
      logger.warn('Not a pull request context. Cannot get Octokit details.');
      return undefined;
    }
    const octokit = getOctokit(githubToken);
    const { owner, repo, number: pull_number } = issue;

    return { octokit, owner, repo, pull_number };
  } catch (error) {
    logger.error(`Failed to get Octokit details: ${error}`);
    return undefined;
  }
};

const getOctokitInstance = (): InstanceType<typeof GitHub> | undefined => {
  try {
    const githubToken = getToken();
    if (!githubToken) {
      logger.error('GitHub token not found. Cannot initialize Octokit.');
      return undefined;
    }
    return getOctokit(githubToken);
  } catch (error) {
    logger.error(`Failed to get Octokit instance: ${error}`);
    return undefined;
  }
};

export const githubProvider = async (): Promise<PlatformProvider> => {
  const providerInstance: PlatformProvider = {
    postReviewComment: async (commentDetails: ReviewComment): Promise<string | undefined> => {
      const { filePath, comment, startLine, endLine } = commentDetails;
      const octokitRepoDetails = getOctokitRepoDetails();
      if (!octokitRepoDetails) {
        logger.error('Could not get Octokit repository details for posting review comment.');
        return undefined;
      }

      const { octokit, owner, repo, pull_number } = octokitRepoDetails;

      try {
        const pullRequest = await octokit.rest.pulls.get({
          owner,
          repo,
          pull_number,
        });
        const commit_id = pullRequest.data.head.sha;

        // For single line comments
        if (startLine === endLine || !startLine) {
          const { data: reviewComment } = await octokit.rest.pulls.createReviewComment({
            owner,
            repo,
            pull_number,
            commit_id,
            body: comment,
            path: filePath,
            line: endLine,
          });
          return reviewComment.html_url;
        }

        // For multi-line comments
        const { data: reviewComment } = await octokit.rest.pulls.createReviewComment({
          owner,
          repo,
          pull_number,
          commit_id,
          body: comment,
          path: filePath,
          line: endLine,
          start_line: startLine,
          start_side: 'RIGHT',
          side: 'RIGHT',
        });
        return reviewComment.html_url;
      } catch (error) {
        logger.error(`Failed to post review comment on GitHub: ${JSON.stringify(error)}`);
        return undefined;
      }
    },

    postThreadComment: async (commentDetails: ThreadComment): Promise<string | undefined> => {
      const { comment } = commentDetails;
      const octokit = getOctokitInstance();
      if (!octokit) return undefined;

      const { payload, issue } = context;

      if (!payload.pull_request) {
        logger.warn('Not a pull request. Skipping commenting on PR thread...');
        return undefined;
      }

      const { owner, repo, number: issue_number } = issue;

      // Note: This simple implementation doesn't handle updating existing comments.
      // It might be desirable to add logic similar to the original commentOnPR
      // if we need to update a 'summary' comment.
      try {
        const { data: issueComment } = await octokit.rest.issues.createComment({
          owner,
          repo,
          issue_number,
          body: comment,
        });
        return issueComment.html_url;
      } catch (error) {
        logger.error(`Failed to post thread comment on GitHub: ${JSON.stringify(error)}`);
        return undefined;
      }
    },
  };

  return providerInstance;
};
