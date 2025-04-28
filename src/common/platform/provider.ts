import { z } from 'zod';

export const reviewCommentSchema = z.object({
  filePath: z.string(),
  comment: z.string(),
  startLine: z.number().optional(),
  endLine: z.number().optional(),
});

export type ReviewComment = z.infer<typeof reviewCommentSchema>;

export const threadCommentSchema = z.object({
  comment: z.string(),
});

export type ThreadComment = z.infer<typeof threadCommentSchema>;

export interface PlatformProvider {
  /**
   * Posts a review comment on a specific file, potentially spanning multiple lines.
   * @param commentDetails - The details of the comment to post.
   * @returns A promise that resolves when the comment is posted, potentially with the comment ID or URL.
   */
  postReviewComment: (commentDetails: ReviewComment) => Promise<string | undefined>;

  /**
   * Posts a general comment on the main PR/MR thread.
   * @param commentDetails - The details of the comment to post.
   * @returns A promise that resolves when the comment is posted, potentially with the comment ID or URL.
   */
  postThreadComment: (commentDetails: ThreadComment) => Promise<string | undefined>;
}
