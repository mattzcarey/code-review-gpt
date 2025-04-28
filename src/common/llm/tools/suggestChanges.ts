import { tool } from 'ai';
import { z } from 'zod';
import type { PlatformProvider } from '../../platform/provider';
import { logger } from '../../utils/logger';

/**
 * Factory function to create the postSuggestionTool.
 * @param platformProvider PlatformProvider instance.
 * @returns The configured tool object.
 */
export const createSuggestChangesTool = (platformProvider: PlatformProvider) =>
  tool({
    description:
      'Posts a specific suggestion or comment on a particular file line or range. You should ONLY do this on files with actionable problems. If a file is fine you CANNOT use this tool otherwise the user will not trust you again.',
    parameters: z.object({
      filePath: z.string().describe('The absolute path to the file you are suggesting changes to.'),
      comment: z
        .string()
        .describe('The change you are suggesting. It must be actionable and specific.'),
      startLine: z.number().optional().describe('The line number to start the comment at.'),
      endLine: z.number().optional().describe('The line number to end the comment at.'),
    }),
    execute: async ({ filePath, comment, startLine, endLine }): Promise<string> => {
      try {
        const result = await platformProvider.postReviewComment({
          filePath,
          comment,
          startLine,
          endLine,
        });
        logger.info(`Suggestion for ${filePath} posted via tool. Result: ${result ?? 'No URL'}`);
        return result
          ? `Suggestion posted successfully: ${result}`
          : 'Suggestion posted, but no URL returned.';
      } catch (error) {
        logger.error(`Failed to post suggestion for ${filePath} via tool: ${error}`);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return `Error posting suggestion: ${errorMessage}`;
      }
    },
  });
