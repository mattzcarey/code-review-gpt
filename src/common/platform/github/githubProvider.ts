import { context, getOctokit } from '@actions/github';
import type { GitHub } from '@actions/github/lib/utils';
import { getGitHubEnvVariables } from '../../../config';
import { signOff } from '../../../review/constants';
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

      // Add the sign-off to the comment
      const botCommentBody = `${comment}\n\n---\n\n${signOff}`;

      try {
        // Check if we already have a comment with our sign-off
        const { data: existingComments } = await octokit.rest.issues.listComments({
          owner,
          repo,
          issue_number,
        });

        // Look for a comment that contains our sign-off
        const existingComment = existingComments.find((comment) => comment.body?.includes(signOff));

        if (existingComment) {
          // Update the existing comment
          const { data: updatedComment } = await octokit.rest.issues.updateComment({
            owner,
            repo,
            comment_id: existingComment.id,
            body: botCommentBody,
          });
          return updatedComment.html_url;
        }
        // Create a new comment
        const { data: issueComment } = await octokit.rest.issues.createComment({
          owner,
          repo,
          issue_number,
          body: botCommentBody,
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
