import { type IFeedback } from "../../../common/model/AIModel"

const formatFeedback = (feedback: IFeedback): string => `
**Risk Level ${feedback.riskScore} - ${feedback.fileName}**

${feedback.details}

`

export const formatFeedbacks = (feedbacks: IFeedback[]): string => `
${feedbacks.map(formatFeedback).join("\n---\n")}
`

export const generateMarkdownReport = (feedbacks: IFeedback[], summary: string): string => `
${formatFeedbacks(feedbacks)}
---
${summary}

`
