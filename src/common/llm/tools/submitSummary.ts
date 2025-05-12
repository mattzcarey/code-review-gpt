import { tool } from 'ai'
import { z } from 'zod'
import type { PlatformProvider, ThreadComment } from '../../platform/provider'
import { logger } from '../../utils/logger'

/**
 * Factory function to create the postReportTool.
 * @param ciProvider Optional CIProvider instance.
 * @returns The configured tool object.
 */
export const createSubmitSummaryTool = (platformProvider: PlatformProvider) =>
  tool({
    description:
      'Posts the final review report as a general comment on the PR. Call this tool when the review is complete.',
    parameters: z.object({
      report: z
        .string()
        .describe(
          'The final review report formatted in markdown. It should contain a brief but specific overview of the changes, and potential edge cases or issues that the reviewer should be aware of.'
        ),
    }),
    execute: async ({ report }): Promise<string> => {
      try {
        const commentDetails: ThreadComment = { comment: report }
        const result = await platformProvider.postThreadComment(commentDetails)
        logger.info(`Report posted via tool. Result: ${result ?? 'No URL'}`)
        return result
          ? `Report posted successfully: ${result}`
          : 'Report posted, but no URL returned.'
      } catch (error) {
        logger.error(`Failed to post report via tool: ${error}`)
        return `Error posting report: ${error}`
      }
    },
  })
