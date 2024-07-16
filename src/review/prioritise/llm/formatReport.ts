import { type IFeedback } from "../../../common/model/AIModel"

const formatFeedback = (
  feedback: IFeedback
): string => `**${feedback.riskScore}/5 - ${feedback.summary}**
<details>
<summary>More details</summary>

Filename: ${feedback.fileName}
Score: ${feedback.riskScore}/5 (lower is better)
Review: 
${feedback.details}
</details>
`

export const formatReport = (feedbacks: IFeedback[], summary: string): string => `
${feedbacks.map(formatFeedback).join("\n\n---\n\n")}
---
${summary}\n`
