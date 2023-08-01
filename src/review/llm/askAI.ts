import { openAIApiKey } from "../../config";
import AIModel from "../../common/model/AIModel";
import {
  createSummary,
  processFeedbacks,
  IFeedback,
} from "./feedbackProcessor";
import { generateMarkdownReport } from "./generateMarkdownReport";
import { logger } from "../../common/utils/logger";

type AskAIResponse = {
  markdownReport: string;
  feedbacks: IFeedback[];
};

export const askAI = async (
  prompts: string[],
  modelName: string
): Promise<AskAIResponse> => {
  logger.info("Asking the experts...");

  const model = new AIModel({
    modelName: modelName,
    temperature: 0.0,
    apiKey: openAIApiKey(),
  });

  const feedbacks = await processFeedbacks(model, prompts);

  logger.debug(
    `Feedback received:\n ${feedbacks.map(
      (feedback) =>
        `Filename: ${feedback.fileName}, logafScore: ${feedback.logafScore}, details: ${feedback.details}\n`
    )}`
  );

  const summary = await createSummary(model, feedbacks);

  logger.debug(`Summary of feedbacks: ${summary}`);

  return {
    markdownReport: generateMarkdownReport(feedbacks, summary),
    feedbacks: feedbacks,
  };
};
