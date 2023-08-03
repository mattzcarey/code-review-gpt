import { IFeedback } from "../../common/types";

const formatFeedback = (feedback: IFeedback): string => `
**LOGAF Level ${feedback.logafScore} - ${feedback.fileName}**

${feedback.details}

`;

export const formatFeedbacks = (feedbacks: IFeedback[]): string => `
${feedbacks.map(formatFeedback).join("\n---\n")}
`;

export const generateMarkdownReport = (
  feedbacks: IFeedback[],
  summary: string
): string => `
${formatFeedbacks(feedbacks)}
---
${summary}

`;
