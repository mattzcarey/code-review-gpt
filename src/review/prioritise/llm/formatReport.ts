import { type IFeedback } from "../../../common/model/AIModel"

const formatFeedback = (feedback: IFeedback): string => `
**Risk Level ${feedback.riskScore} - ${feedback.fileName}**

${feedback.details}

`

export const joinFeedbacks = (feedbacks: IFeedback[]): string => `
${feedbacks.map(formatFeedback).join("\n---\n")}
`

export const formatReport = (feedbacks: IFeedback[], summary: string): string => `
${joinFeedbacks(feedbacks)}
---
${summary}

`
