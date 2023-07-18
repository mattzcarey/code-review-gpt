import AIModel from "./AIModel";
import { completionPrompt } from "../constants";

interface IFeedback {
  feedback: string;
}

const collectAndLogFeedback = async (
  feedbackPromise: Promise<string>
): Promise<IFeedback> => {
  try {
    const feedback = await feedbackPromise;
    console.log(feedback);
    return { feedback };
  } catch (error) {
    console.error(`Error in processing prompt`, error);
    throw error;
  }
};

const createSummary = async (
  model: AIModel,
  feedbacks: string[]
): Promise<string> => {
  const finalPrompt = completionPrompt.replace(
    "{feedback}",
    feedbacks.join("\n---\n")
  );

  const summary = await model.callModel(finalPrompt);
  console.log(summary);
  return summary;
};

const processFeedbacks = async (
  model: AIModel,
  prompts: string[]
): Promise<string[]> => {
  const feedbackPromises = prompts.map((prompt) => model.callModel(prompt));

  const feedbackResults = await Promise.allSettled(
    feedbackPromises.map(collectAndLogFeedback)
  );

  const feedbacks = feedbackResults.reduce(
    (accumulatedFeedbacks, feedbackResult) => {
      if (feedbackResult.status === "fulfilled") {
        accumulatedFeedbacks.push(feedbackResult.value.feedback);
      }
      return accumulatedFeedbacks;
    },
    [] as string[]
  );

  return feedbacks;
};

export { createSummary, processFeedbacks };
