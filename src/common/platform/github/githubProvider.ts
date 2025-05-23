import { createHash } from 'node:crypto'
import { context, getOctokit } from '@actions/github'
import type { GitHub } from '@actions/github/lib/utils'
import { getGitHubEnvVariables } from '../../../config'
import type { TokenUsage, ToolCall } from '../../../review/types'
import { FORMATTING, formatSummary } from '../../formatting/summary'
import { formatUsage } from '../../formatting/usage'
import { PlatformOptions } from '../../types'
import { logger } from '../../utils/logger'
import type { PlatformProvider, ReviewComment, ThreadComment } from '../provider'

const getToken = (): string => {
  const { githubToken } = getGitHubEnvVariables()
  if (!githubToken) {
    throw new Error('GITHUB_TOKEN is not set')
  }
  return githubToken
}

interface OctokitRepoDetails {
  octokit: InstanceType<typeof GitHub>
  owner: string
  repo: string
  pull_number: number
}

const getOctokitRepoDetails = (): OctokitRepoDetails | undefined => {
  try {
    const githubToken = getToken()
    const { payload, issue } = context

    if (!payload.pull_request) {
      logger.warn('Not a pull request context. Cannot get Octokit details.')
      return undefined
    }
    const octokit = getOctokit(githubToken)
    const { owner, repo, number: pull_number } = issue

    return { octokit, owner, repo, pull_number }
  } catch (error) {
    logger.error(`Failed to get Octokit details: ${error}`)
    return undefined
  }
}

const getOctokitInstance = (): InstanceType<typeof GitHub> | undefined => {
  try {
    const githubToken = getToken()
    if (!githubToken) {
      logger.error('GitHub token not found. Cannot initialize Octokit.')
      return undefined
    }
    return getOctokit(githubToken)
  } catch (error) {
    logger.error(`Failed to get Octokit instance: ${error}`)
    return undefined
  }
}

export const githubProvider = async (): Promise<PlatformProvider> => {
  const providerInstance: PlatformProvider = {
    postReviewComment: async (
      commentDetails: ReviewComment
    ): Promise<string | undefined> => {
      const { filePath, comment, startLine, endLine } = commentDetails
      const octokitRepoDetails = getOctokitRepoDetails()
      if (!octokitRepoDetails) {
        logger.error(
          'Could not get Octokit repository details for posting review comment.'
        )
        return undefined
      }

      const { octokit, owner, repo, pull_number } = octokitRepoDetails

      try {
        const pullRequest = await octokit.rest.pulls.get({
          owner,
          repo,
          pull_number,
        })
        const commit_id = pullRequest.data.head.sha

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
          })
          return reviewComment.html_url
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
        })
        return reviewComment.html_url
      } catch (error) {
        logger.error(`Failed to post review comment on GitHub: ${JSON.stringify(error)}`)
        return undefined
      }
    },

    postThreadComment: async (
      commentDetails: ThreadComment
    ): Promise<string | undefined> => {
      const { comment } = commentDetails
      const octokit = getOctokitInstance()
      if (!octokit) return undefined

      const { payload, issue } = context

      if (!payload.pull_request) {
        logger.warn('Not a pull request. Skipping commenting on PR thread...')
        return undefined
      }

      const { owner, repo, number: issue_number } = issue

      // Format the comment using the centralized function
      const botCommentBody = formatSummary(comment)

      try {
        // Check if we already have a comment with our sign-off
        const { data: existingComments } = await octokit.rest.issues.listComments({
          owner,
          repo,
          issue_number,
        })

        // Look for a comment that contains our sign-off
        const existingComment = existingComments.find((comment) =>
          comment.body?.includes(FORMATTING.SIGN_OFF)
        )

        if (existingComment) {
          // Update the existing comment
          const { data: updatedComment } = await octokit.rest.issues.updateComment({
            owner,
            repo,
            comment_id: existingComment.id,
            body: botCommentBody,
          })
          return updatedComment.html_url
        }
        // Create a new comment
        const { data: issueComment } = await octokit.rest.issues.createComment({
          owner,
          repo,
          issue_number,
          body: botCommentBody,
        })
        return issueComment.html_url
      } catch (error) {
        logger.error(`Failed to post thread comment on GitHub: ${JSON.stringify(error)}`)
        return undefined
      }
    },

    getPlatformOption: (): PlatformOptions => {
      return PlatformOptions.GITHUB
    },

    submitUsage: async (tokenUsage: TokenUsage, toolUsage: ToolCall[]): Promise<void> => {
      const octokit = getOctokitInstance()
      if (!octokit) return

      const { payload, issue } = context

      if (!payload.pull_request) {
        logger.warn('Not a pull request. Skipping usage data submission...')
        return
      }

      const { owner, repo, number: issue_number } = issue

      try {
        // Check if we already have a comment with our sign-off
        const { data: existingComments } = await octokit.rest.issues.listComments({
          owner,
          repo,
          issue_number,
        })

        // Look for a comment that contains our sign-off
        const existingComment = existingComments.find((comment) =>
          comment.body?.includes(FORMATTING.SIGN_OFF)
        )

        if (existingComment) {
          // Get the current body
          const currentBody = existingComment.body || ''

          // Format the usage data with both current and accumulated stats
          const usageSection = formatUsage(tokenUsage, toolUsage, currentBody)

          // Check if there's already a usage section
          let newBody = currentBody
          if (newBody.includes(`<summary>${FORMATTING.TOKEN_USAGE_TITLE}</summary>`)) {
            // Replace the existing usage section
            newBody = newBody.replace(
              new RegExp(
                `<details>\\s*<summary>${FORMATTING.TOKEN_USAGE_TITLE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}<\\/summary>[\\s\\S]*?<\\/details>`
              ),
              usageSection
            )
          } else {
            // Add the usage section before the sign-off
            const signOffIndex = newBody.lastIndexOf(
              FORMATTING.SEPARATOR + FORMATTING.SIGN_OFF
            )
            if (signOffIndex !== -1) {
              newBody = `${newBody.substring(0, signOffIndex)}\n${usageSection}${newBody.substring(signOffIndex)}`
            } else {
              // Just append to the end if we can't find the sign-off
              newBody = `${newBody}\n${usageSection}`
            }
          }

          // Update the comment
          await octokit.rest.issues.updateComment({
            owner,
            repo,
            comment_id: existingComment.id,
            body: newBody,
          })

          logger.info('Usage data added to thread comment.')
        } else {
          logger.warn('No existing thread comment found to append usage data to.')
        }
      } catch (error) {
        logger.error(
          `Failed to update thread comment with usage data: ${JSON.stringify(error)}`
        )
      }
    },

    getRepoId: (): string => {
      try {
        const { owner, repo } = context.repo
        const repoIdentifier = `${owner}/${repo}`

        return createHash('sha256').update(repoIdentifier).digest('hex').substring(0, 32)
      } catch (error) {
        logger.error(`Failed to get repo ID: ${error}`)
        return 'github_repo_anonymous'
      }
    },
  }

  return providerInstance
}
