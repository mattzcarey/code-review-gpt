import type { IFeedback, IReviews } from '../../common/types';

// Format review for Jira
export const formatReviewForJira = (reviews: IReviews): string => {
  return reviews
    .map((review) => `${review.reasoning}`)
    .join('\n');
};

// Format feedback for Jira
const formatFeedbackForJira = (feedback: IFeedback): string => `
h3. Risk Level ${feedback.riskScore} - ${feedback.fileName}

{noformat}
${formatReviewForJira(feedback.review)}
{noformat}
`;

// Generate Jira report
export const jiraReport = (feedbacks: IFeedback[]): string => `${feedbacks.map(formatFeedbackForJira).join('\n----\n')}`; 