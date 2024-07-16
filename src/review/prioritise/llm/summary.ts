import type { IFeedback } from "../../../common/model/AIModel"
import type AIModel from "../../../common/model/AIModel"
import { logger } from "../../../common/utils/logger"
import { summaryPrompt } from "../prompt/prompts"

export const createSummary = async (model: AIModel, feedbacks: IFeedback[]): Promise<string> => {
  const finalPrompt = summaryPrompt.replace("{feedback}", JSON.stringify(feedbacks))

  const summary = await model.callModel(finalPrompt)

  logger.info(summary)

  return summary
}
