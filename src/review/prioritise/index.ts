import AIModel from "../../common/model/AIModel"
import type { AskAIResponse } from "../../common/types"
import { logger } from "../../common/utils/logger"
import { processFeedbacks } from "./llm/feedback"
import { formatReport } from "./llm/formatReport"
import { createSummary } from "./llm/summary"

export const priorityReport = async (
  prompts: string[],
  modelName: string,
  openAIApiKey: string,
  organization?: string,
  generateSummary?: boolean
): Promise<AskAIResponse> => {
  logger.info("Building report")

  const model = new AIModel({
    modelName: modelName,
    temperature: 0.0,
    apiKey: openAIApiKey,
    organization
  })

  const feedbacks = await processFeedbacks(model, prompts)

  logger.debug(
    `Feedback received:\n ${feedbacks
      .map(
        feedback =>
          `Filename: ${feedback.filePath}, RiskScore: ${feedback.riskScore}, Details: ${feedback.details}\n`
      )
      .toString()}`
  )

  let summary = ""
  if (generateSummary) {
    summary = await createSummary(model, feedbacks)

    logger.debug(`Summary of feedbacks: ${summary}`)
  } else {
    logger.debug("Summary generation is disabled.")
  }

  return {
    markdownReport: formatReport(feedbacks, summary),
    feedbacks: feedbacks
  }
}
