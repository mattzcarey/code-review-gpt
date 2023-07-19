import { IFeedbackWithRating } from "./feedbackProcessor";

const formatFeedback = (feedback: IFeedbackWithRating): string => `
**LOGAF Level ${feedback.logafScore} - ${feedback.fileName}**

${feedback.details}

`;

export const formatFeedbacks = (feedbacks: IFeedbackWithRating[]): string => `
${feedbacks.map(formatFeedback).join("\n---\n")}
`;

export const generateMarkdownReport = (
  feedbacks: IFeedbackWithRating[],
  summary: string
): string => `
${formatFeedbacks(feedbacks)}
---
${summary}

`;
