import AIModel from "./AIModel";
import { completionPrompt, maxFeedbackCount, ratingPrompt } from "../constants";
import PriorityQueue from "./PriorityQueue";

interface IFeedback {
  feedback: string;
}

const collectAndLogFeedback = async (
  feedbackPromise: Promise<string>
): Promise<IFeedback> => {
  try {
    const feedback = await feedbackPromise;
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

const getFeedbackRatings = async (
  model: AIModel,
  feedbacks: string[]
): Promise<number[]> => {
  const ratingPromptWithFeedbacks = ratingPrompt.replace(
    "{feedback}",
    feedbacks.join("\n---\n")
  );

  const feedbackRatings = await model.callModel(ratingPromptWithFeedbacks);
  const ratings = feedbackRatings.split(",").map((rating) => Number(rating));

  return ratings;
};

const pickBestFeedbacks = async (
  model: AIModel,
  feedbacks: string[],
  limit: number
): Promise<string[]> => {
  const parsedFeedbacks = feedbacks.flatMap((feedback) =>
    feedback.split("---")
  );

  const ratings = await getFeedbackRatings(model, parsedFeedbacks);

  const ratingPriorityQueue = new PriorityQueue<string>();

  parsedFeedbacks.forEach((feedback, index) => {
    ratingPriorityQueue.enqueue(feedback, ratings[index]);
    if (ratingPriorityQueue.size() > limit) {
      ratingPriorityQueue.dequeue();
    }
  });

  return ratingPriorityQueue.getItems();
};

const extractFulfilledFeedbacks = (
  feedbackResults: PromiseSettledResult<IFeedback>[]
): string[] => {
  return feedbackResults.reduce((accumulatedFeedbacks, feedbackResult) => {
    if (feedbackResult.status === "fulfilled") {
      accumulatedFeedbacks.push(feedbackResult.value.feedback);
    }
    return accumulatedFeedbacks;
  }, [] as string[]);
};

const processFeedbacks = async (
  model: AIModel,
  prompts: string[]
): Promise<string[]> => {
  const feedbackPromises = prompts.map((prompt) => model.callModel(prompt));

  const feedbackResults = await Promise.allSettled(
    feedbackPromises.map(collectAndLogFeedback)
  );

  const feedbacks = extractFulfilledFeedbacks(feedbackResults);

  return pickBestFeedbacks(model, feedbacks, maxFeedbackCount);
};

export { createSummary, processFeedbacks };
