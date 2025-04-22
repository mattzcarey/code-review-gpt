import type { IFeedback, IReviews } from '../../common/types';

// Format review for Jira
export const formatReviewForJira = (reviews: IReviews): string => {
  return reviews
    .map((review) => `${review.reasoning}`)
    .join('\\n\\n');
};

// Get background color based on risk score
const getBackgroundColor = (riskScore: number): string => {
  if (riskScore >= 4) return '#ffebe6'; // Red for high risk
  if (riskScore >= 2) return '#fff';    // Yellow for medium risk
  return '#deebff';                     // Blue for low risk
};

// Format feedback for Jira
const formatFeedbackForJira = (feedback: IFeedback): string => `
{panel:title=Risk Level ${feedback.riskScore} - ${feedback.fileName}|bgColor=${getBackgroundColor(feedback.riskScore)}}
${formatReviewForJira(feedback.review)}
{panel}`;

// Generate Jira report
export const jiraReport = (feedbacks: IFeedback[]): string => `${feedbacks.map(formatFeedbackForJira).join('\n----\n')}`; 