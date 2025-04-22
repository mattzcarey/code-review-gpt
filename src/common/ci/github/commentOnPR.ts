import { context, getOctokit } from '@actions/github';

import { logger } from '../../utils/logger';
import { getToken } from '../utils';

/**
 * Publish a comment on the pull request. If the bot has already commented (i.e. a comment with the same sign off exists), update the comment instead of creating a new one.
 * The comment will be signed off with the provided sign off.
 * @param comment The body of the comment to publish.
 * @param signOff The sign off to use. This also serves as key to check if the bot has already commented and update the comment instead of posting a new one if necessary.
 * @returns
 */
export const commentOnPR = async (comment: string, signOff: string): Promise<void> => {
  try {
    const githubToken = getToken();
    logger.warn('context commentOnPR', context);
    const { payload, issue } = context;
    
    // Если есть pull_request, комментируем к PR
    if (payload.pull_request) {
      const octokit = getOctokit(githubToken);
      const { owner, repo, number: pull_number } = issue;

      const { data: comments } = await octokit.rest.issues.listComments({
        owner,
        repo,
        issue_number: pull_number,
      });

      const botComment = comments.find((comment) => comment.body?.includes(signOff));

      const botCommentBody = `${comment}\n\n---\n\n${signOff}`;

      if (botComment) {
        await octokit.rest.issues.updateComment({
          owner,
          repo,
          comment_id: botComment.id,
          body: botCommentBody,
        });
      } else {
        // If the bot has not commented yet, create a new comment
        await octokit.rest.issues.createComment({
          owner,
          repo,
          issue_number: pull_number,
          body: botCommentBody,
        });
      }
    }
    // Если нет pull_request, но есть commit, комментируем к коммиту
    else if (payload.head_commit) {
      logger.info('Not a pull request, but a commit. Commenting on commit...');
      const octokit = getOctokit(githubToken);
      const { owner, repo } = context.repo;
      const { sha } = context.payload.head_commit;
      
      const botCommentBody = `${comment}\n\n---\n\n${signOff}`;
      
      await octokit.rest.repos.createCommitComment({
        owner,
        repo,
        commit_sha: sha,
        body: botCommentBody,
      });
    } 
    else {
      logger.warn('Not a pull request or commit. Skipping commenting...');
    }
  } catch (error) {
    logger.error(`Failed to comment: ${JSON.stringify(error)}`);
    throw error;
  }
};
