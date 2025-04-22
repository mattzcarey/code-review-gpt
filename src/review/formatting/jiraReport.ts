import type { IFeedback, IReviews } from '../../common/types';

// Format review for Jira
export const formatReviewForJira = (reviews: IReviews): string => {
  return reviews
    .map((review) => `${review.reasoning}`)
    .join('\\n\\n');
};

// Format feedback for Jira
const formatFeedbackForJira = (feedback: IFeedback): string => `
{panel:title=Risk Level ${feedback.riskScore} - ${feedback.fileName}|borderStyle=dashed|borderColor=#ccc|titleBGColor=#f7f7f7|bgColor=#fff}
${formatReviewForJira(feedback.review)}
{panel}
`;

// Generate Jira report
export const jiraReport = (feedbacks: IFeedback[]): string => `${feedbacks.map(formatFeedbackForJira).join('\n----\n')}`; 