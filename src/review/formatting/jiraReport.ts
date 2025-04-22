import type { IFeedback, IReviews } from '../../common/types';

// Format review for Jira
export const formatReviewForJira = (reviews: IReviews): string => {
  return reviews
    .map(
      (review) => `
{panel:title=Review}
{panel}

${review.reasoning}

${
  review.suggestedChanges
    ? `*Suggested changes:*
{code:language=java}
${review.suggestedChanges}
{code}
`
    : ''
}

{panel:title=Original Code}
{code:language=java}
${review.targetCodeBlock}
{code}
{panel}
`
    )
    .join('\n');
};

// Format feedback for Jira
const formatFeedbackForJira = (feedback: IFeedback): string => `
h3. Risk Level ${feedback.riskScore} - ${feedback.fileName}

${formatReviewForJira(feedback.review)}
`;

// Generate Jira report
export const jiraReport = (feedbacks: IFeedback[]): string => `
h2. Code Review Report

${feedbacks.map(formatFeedbackForJira).join('\n----\n')}
`; 