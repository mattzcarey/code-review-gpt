import { createSummary, processFeedbacks } from "./feedbackProcessor";
import AIModel from "./AIModel";
import { openAIApiKey } from "../../config";

export const askAI = async (
  prompts: string[],
  modelName: string
): Promise<string> => {
  console.info("Asking the experts...");

  const model = new AIModel({
    modelName: modelName,
    temperature: 0.0,
    apiKey: openAIApiKey(),
  });

  const feedbacks = await processFeedbacks(model, prompts);

  const summary = await createSummary(model, feedbacks);

  return `${feedbacks.join("\n---\n")}\n\n---\n\n${summary}`;
};
