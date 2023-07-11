import { OpenAIChat } from "langchain/llms/openai";
import { completionPrompt, signOff } from "./constants";
import { openAIApiKey } from "./args";

const model = new OpenAIChat({
  openAIApiKey: openAIApiKey(),
  modelName: "gpt-4",
  temperature: 0.0,
});

const callModel = (prompt: string): Promise<string> => {
  return model.call(prompt);
};

const createSummary = async (feedbacks: string[]): Promise<string> => {
  const finalPrompt = completionPrompt.replace(
    "{feedback}",
    feedbacks.join("\n---\n")
  );

  const emojis = await callModel(finalPrompt);

  const summary = `\n\n${emojis}`;
  console.log(summary);

  return summary;
};

export const askAI = async (prompts: string[]): Promise<string> => {
  console.info("Asking the experts...");

  const feedbackPromises = prompts.map((prompt) => callModel(prompt));

  const feedbacks: string[] = [];

  const collectAndLogFeedback = async (
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

  await Promise.allSettled(feedbackPromises.map(collectAndLogFeedback));
  const summary = await createSummary(feedbacks);

  return feedbacks.join("\n---\n") + "\n---\n" + summary;
};
