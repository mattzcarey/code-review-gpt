import type { IFeedback, IReviews } from '../../common/types';


const formatReview = (reviews: IReviews): string => {
  return reviews.map((review) => `
${review.reasoning}

${review.suggestedChanges ? `\`\`\`suggestion
${review.suggestedChanges}
\`\`\`
` : ''}

\`\`\`code
${review.targetCodeBlock}
\`\`\`
`).join('\n');
};

const formatFeedback = (feedback: IFeedback): string => `
**Risk Level ${feedback.riskScore} - ${feedback.fileName}**

${formatReview(feedback.review)}
`;

export const markdownReport = (feedbacks: IFeedback[]): string => `
${feedbacks.map(formatFeedback).join('\n---\n')}
`;
