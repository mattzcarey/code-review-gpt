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
  modelName: string,
  verbose = true
): Promise<AskAIResponse> => {
  if (verbose) {
    logger.error("Asking the experts...");
  }

  const model = new AIModel({
    modelName: modelName,
    temperature: 0.0,
    apiKey: openAIApiKey(),
  });

  const feedbacks = await processFeedbacks(model, prompts, verbose);

  const summary = await createSummary(model, feedbacks, verbose);

  return {
    markdownReport: generateMarkdownReport(feedbacks, summary),
    feedbacks: feedbacks,
  };
};
