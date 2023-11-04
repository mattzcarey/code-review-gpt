import { createSummary, processFeedbacks, Review } from "./feedbackProcessor";
import AIModel from "../../common/model/AIModel";
import { AskAIResponse } from "../../common/types";
import { logger } from "../../common/utils/logger";




export const askAI = async (
  review:Review,
  modelName: string,
  openAIApiKey: string,
  organization: string | undefined,
  provider: string,
  skipSummary: boolean
): Promise<AskAIResponse> => {

  logger.info("Asking the experts...");


  const model = new AIModel({
    modelName: modelName,
    temperature: 0.0,
    apiKey: openAIApiKey,
    organization,
    provider,
  });

  const feedbacks = await processFeedbacks(model, review);

  logger.debug(
    `Feedback received:\n ${feedbacks
      .map(
        (feedback) =>
          `Filename: ${feedback.fileName},Line: ${feedback.line}, RiskScore: ${feedback.riskScore}, Details: ${feedback.details}\n`
      )
      .toString()}`
  );

  
  const summary = skipSummary?"":await createSummary(model, feedbacks);

  logger.debug(`Summary of feedbacks: ${summary}`);

  return {

    summary,
    feedbacks: feedbacks,
  };
};
