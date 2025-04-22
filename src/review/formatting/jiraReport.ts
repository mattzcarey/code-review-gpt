import type { IFeedback, IReviews } from '../../common/types';

// Format review for Jira
export const formatReviewForJira = (reviews: IReviews): string => {
  return reviews
    .map((review) => `${review.reasoning}`)
    .join('\n\n');
};

// Format feedback for Jira
const formatFeedbackForJira = (feedback: IFeedback): string => `
h1. Risk Level ${feedback.riskScore} - ${feedback.fileName}
\n\n*✨AI Code review*\n\n
${formatReviewForJira(feedback.review)}
\n\n
`;

// Generate Jira report
export const jiraReport = (feedbacks: IFeedback[]): string => `${feedbacks.map(formatFeedbackForJira).join('\n----\n')}`; 