import { IFeedback } from "../../common/types";

export const formatFeedback = (feedback: IFeedback): string => `
**Risk Level ${feedback.riskScore} - ${feedback.fileName}**

${feedback.details}

`;

export const formatFeedbacks = (feedbacks: IFeedback[]): string => `
${feedbacks.map(formatFeedback).join("\n---\n")}
`;

export const generateMarkdownReport = (
  modelName: string,
  feedbacks: IFeedback[],
  summary: string
): string => `
Model: ${modelName}
--
${formatFeedbacks(feedbacks)}
---
${summary}

`;
