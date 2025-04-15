import type { IFeedback, IReviews } from '../../common/types';

export const formatReview = (reviews: IReviews): string => {
  return reviews
    .map(
      (review) => `
${review.reasoning}

${
  review.suggestedChanges
    ? `Suggested changes:
\`\`\`suggestion
${review.suggestedChanges}
\`\`\`
`
    : ''
}

<details>
<summary>View Original Code</summary>

\`\`\`code
${review.targetCodeBlock}
\`\`\`

</details>
`
    )
    .join('\n');
};

const formatFeedback = (feedback: IFeedback): string => `
**Risk Level ${feedback.riskScore} - ${feedback.fileName}**

${formatReview(feedback.review)}
`;

export const markdownReport = (feedbacks: IFeedback[]): string => `
${feedbacks.map(formatFeedback).join('\n---\n')}
`;
