import { context, getOctokit } from '@actions/github';
import fs from 'fs';

import { logger } from '../../utils/logger';
import { getToken } from '../utils';

/**
 * Save comment URL to GitHub Actions output
 * @param commentUrl URL of the comment to save
 */
const saveCommentUrl = (commentUrl: string): void => {
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `comment_url<<EOF\n${commentUrl}\nEOF\n`);
    logger.info(`Comment URL saved to GitHub Actions output: ${commentUrl}`);
  }
};

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
    // logger.warn('context commentOnPR', context);
    const { payload, issue } = context;
    const octokit = getOctokit(githubToken);
    const { owner, repo } = context.repo;
    const botCommentBody = `${comment}\n\n---\n\n${signOff}`;
    
    // If there is a pull_request, comment on the PR
    if (payload.pull_request) {
      const { number: pull_number } = issue;

      const { data: comments } = await octokit.rest.issues.listComments({
        owner,
        repo,
        issue_number: pull_number,
      });

      const botComment = comments.find((comment) => comment.body?.includes(signOff));

      let commentUrl: string;

      if (botComment) {
        const { data: updatedComment } = await octokit.rest.issues.updateComment({
          owner,
          repo,
          comment_id: botComment.id,
          body: botCommentBody,
        });
        commentUrl = updatedComment.html_url;
      } else {
        // If the bot has not commented yet, create a new comment
        const { data: newComment } = await octokit.rest.issues.createComment({
          owner,
          repo,
          issue_number: pull_number,
          body: botCommentBody,
        });
        commentUrl = newComment.html_url;
      }

      saveCommentUrl(commentUrl);
    } 
    // If there is no pull_request, but there is a commit, comment on the commit
    else {
      // Determine the commit SHA
      let commitSha: string | undefined;
      
      if (payload.head_commit && payload.head_commit.sha) {
        commitSha = payload.head_commit.sha;
        logger.info('Using commit SHA from payload.head_commit');
      } else if (process.env.GITHUB_SHA) {
        commitSha = process.env.GITHUB_SHA;
        logger.info('Using commit SHA from GITHUB_SHA environment variable');
      }
      
      if (commitSha) {
        logger.info('Commenting on commit...');
        
        const { data: commitComment } = await octokit.rest.repos.createCommitComment({
          owner,
          repo,
          commit_sha: commitSha,
          body: botCommentBody,
        });

        saveCommentUrl(commitComment.html_url);
      } else {
        logger.warn('No commit SHA found. Skipping commenting...');
      }
    }
  } catch (error) {
    logger.error(`Failed to comment: ${JSON.stringify(error)}`);
    throw error;
  }
};
