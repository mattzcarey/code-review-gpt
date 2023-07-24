import { openAIApiKey } from "../../config";
import AIModel from "../../common/model/AIModel";
import { createSummary, processFeedbacks } from "./feedbackProcessor";
import { generateMarkdownReport } from "./generateMarkdownReport";

export const askAI = async (
  prompts: string[],
  modelName: string,
  verbose = true
): Promise<string> => {
  if (verbose) {
    console.info("Asking the experts...");
  }

  const model = new AIModel({
    modelName: modelName,
    temperature: 0.0,
    apiKey: openAIApiKey(),
  });

  const feedbacks = await processFeedbacks(model, prompts, verbose);

  const summary = await createSummary(model, feedbacks, verbose);

  return generateMarkdownReport(feedbacks, summary);
};
