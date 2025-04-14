import type { PromptFile } from '../../../common/types';

/**
 * Creates a preamble string containing context for the AI review.
 * Includes a placeholder for the review goal and lists the files in the current batch.
 *
 * @param filesInBatch - An array of PromptFile objects included in the current batch.
 * @returns A markdown formatted string to be prepended to the AI prompt.
 */
export const createReviewPreamble = (filesInBatch: PromptFile[]): string => {
  const fileList = filesInBatch.map((file) => `- ${file.fileName}`).join('\n');

  return `Review Goal: [Goal placeholder - to be implemented]

Files in this review batch:
${fileList}
---
`; // Added separator
};
