import { OpenAIChat } from "langchain/llms/openai";
import dotenv from "dotenv";
import { completionPrompt } from "./constants";

dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  throw new Error("Missing OPENAI_API_KEY environment variable");
}

const model = new OpenAIChat({
  openAIApiKey: apiKey,
  modelName: "gpt-4",
  temperature: 0.0,
});

const callModel = async (prompt: string) => {
  try {
    const response = await model.call(prompt);
    console.log(response);
    return response;
  } catch (error) {
    console.error(`Error in processing prompt ${prompt}`, error);
    throw error;
  }
};

export const askAI = async (prompts: string[]): Promise<void> => {
  console.info("Asking the experts...");

  const feedbackPromises = prompts.map((prompt) => callModel(prompt));

  const feedbacks: string[] = [];

  const logAndCollectFeedback = async (
    feedbackPromise: Promise<string>,
    index: number
  ): Promise<void> => {
    try {
      const feedback = await feedbackPromise;
      console.log(feedback);
      feedbacks.push(feedback);
    } catch (error) {
      console.error(`Error in processing prompt ${index + 1}`, error);
    }
  };

  await Promise.allSettled(feedbackPromises.map(logAndCollectFeedback));

  const finalPrompt = completionPrompt.replace(
    "{feedback}",
    feedbacks.join("\n---\n")
  );

  console.log(await callModel(finalPrompt));
};
