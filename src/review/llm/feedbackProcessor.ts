import AIModel from "./AIModel";
import { completionPrompt, maxFeedbackCount, ratingPrompt } from "../constants";
import PriorityQueue from "./PriorityQueue";
import { formatFeedbacks } from "./generateMarkdownReport";

export interface IFeedback {
  fileName: string;
  logafScore: number;
  details: string;
}

export interface IFeedbackWithRating extends IFeedback {
  rating: number;
}

const collectAndLogFeedback = async (
  feedbackPromise: Promise<IFeedback[]>
): Promise<IFeedback[]> => {
  try {
    const feedbacks = await feedbackPromise;
    return feedbacks;
  } catch (error) {
    console.error(`Error in processing prompt`, error);
    throw error;
  }
};

const createSummary = async (
  model: AIModel,
  feedbacks: IFeedbackWithRating[]
): Promise<string> => {
  const finalPrompt = completionPrompt.replace(
    "{feedback}",
    JSON.stringify(feedbacks)
  );

  const summary = await model.callModel(finalPrompt);
  console.log(summary);
  return summary;
};

const rateFeedbacks = async (
  model: AIModel,
  feedbacks: IFeedback[]
): Promise<IFeedbackWithRating[]> => {
  const ratingPromptWithFeedbacks = ratingPrompt.replace(
    "{feedback}",
    JSON.stringify(feedbacks)
  );

  return await model.callModelJSON<IFeedbackWithRating[]>(
    ratingPromptWithFeedbacks
  );
};

const pickBestFeedbacks = async (
  model: AIModel,
  feedbacks: IFeedback[],
  limit: number
): Promise<IFeedbackWithRating[]> => {
  const ratedFeedbacks = await rateFeedbacks(model, feedbacks);

  const ratingPriorityQueue = new PriorityQueue<IFeedbackWithRating>();

  ratedFeedbacks.forEach((feedback) => {
    ratingPriorityQueue.enqueue(feedback, feedback.rating);
    if (ratingPriorityQueue.size() > limit) {
      ratingPriorityQueue.dequeue();
    }
  });

  return ratingPriorityQueue.getItems();
};

const extractFulfilledFeedbacks = (
  feedbackResults: PromiseSettledResult<IFeedback[]>[]
): IFeedback[] => {
  return feedbackResults.reduce((accumulatedFeedbacks, feedbackResult) => {
    if (feedbackResult.status === "fulfilled") {
      accumulatedFeedbacks.push(...feedbackResult.value);
    }
    return accumulatedFeedbacks;
  }, [] as IFeedback[]);
};

const processFeedbacks = async (
  model: AIModel,
  prompts: string[]
): Promise<IFeedbackWithRating[]> => {
  const feedbackPromises = prompts.map((prompt) =>
    model.callModelJSON<IFeedback[]>(prompt)
  );

  const feedbackResults = await Promise.allSettled(
    feedbackPromises.map(collectAndLogFeedback)
  );

  const feedbacks = extractFulfilledFeedbacks(feedbackResults);

  const bestFeedbacks = await pickBestFeedbacks(
    model,
    feedbacks,
    maxFeedbackCount
  );

  console.log(formatFeedbacks(bestFeedbacks));

  return bestFeedbacks;
};

export { createSummary, processFeedbacks };
