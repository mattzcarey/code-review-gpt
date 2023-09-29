import AIModel from "../../common/model/AIModel";
import { AskAIResponse } from "../../common/types";
import { logger } from "../../common/utils/logger";
import { createSummary, processFeedbacks } from "./feedbackProcessor";
import { generateMarkdownReport } from "./generateMarkdownReport";

export const askAI = async (
  prompts: string[],
  modelName: string,
  openAIApiKey: string,
  organization: string | undefined,
  provider: string
): Promise<AskAIResponse> => {
  logger.info("Asking the experts...");

  const model = new AIModel({
    modelName: modelName,
    temperature: 0.0,
    apiKey: openAIApiKey,
    organization,
    provider,
  });

  const feedbacks = await processFeedbacks(model, prompts);

  logger.debug(
    `Feedback received:\n ${feedbacks
      .map(
        (feedback) =>
          `Filename: ${feedback.fileName}, RiskScore: ${feedback.riskScore}, Details: ${feedback.details}\n`
      )
      .toString()}`
  );
  const summary = await createSummary(model, feedbacks);

  logger.debug(`Summary of feedbacks: ${summary}`);

  return {
    markdownReport: generateMarkdownReport(feedbacks, summary),
    feedbacks: feedbacks,
  };
};
