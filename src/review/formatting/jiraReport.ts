import type { IFeedback, IReviews } from '../../common/types';

// Format review for Jira
export const formatReviewForJira = (reviews: IReviews): string => {
  return reviews
    .map((review) => `${review.reasoning}`)
    .join('\\n');
};

// Format feedback for Jira
const formatFeedbackForJira = (feedback: IFeedback): string => `
*Risk Level ${feedback.riskScore} - ${feedback.fileName}*
\\n\\n
${formatReviewForJira(feedback.review)}
\\n\\n
`;

// Generate Jira report
export const jiraReport = (feedbacks: IFeedback[]): string => `${feedbacks.map(formatFeedbackForJira).join('\n----\n')}`; 