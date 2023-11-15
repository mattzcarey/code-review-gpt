import { signOff } from "../../constants";
import { ReviewFile } from "../../types";

export const formatReviewComment = (review: ReviewFile): string => {
  const suggestionSection = review.suggestedCode
    ? `\`\`\`suggestion\n${review.suggestedCode}\n\`\`\`\n`
    : "";

  return `*Category: ${review.category}*\n\n${review.description}\n\n${suggestionSection}\n\n---\n\n${signOff}`;
};
