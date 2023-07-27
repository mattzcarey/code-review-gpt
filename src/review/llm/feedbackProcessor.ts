import AIModel from "../../common/model/AIModel";
import { maxFeedbackCount } from "../constants";
import { completionPrompt } from "../prompt/prompts";
import PriorityQueue from "./PriorityQueue";
import { formatFeedbacks } from "./generateMarkdownReport";

export interface IFeedback {
  fileName: string;
  logafScore: number;
  details: string;
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
  feedbacks: IFeedback[],
  verbose = true
): Promise<string> => {
  const finalPrompt = completionPrompt.replace(
    "{feedback}",
    JSON.stringify(feedbacks)
  );

  const summary = await model.callModel(finalPrompt);

  if (verbose) {
    console.log(summary);
  }

  return summary;
};

const pickBestFeedbacks = async (
  feedbacks: IFeedback[],
  limit: number
): Promise<IFeedback[]> => {
  // Filter out feedbacks with logafScore of 4 and 5, since we don't need to display them.
  const filteredFeedbacks = feedbacks.filter(
    (feedback) => feedback.logafScore < 4
  );

  // Use the priority queue with some randomization to pick feedbacks to display. This is to avoid showing the same feedbacks every time. We add weights so that feedbacks with lower logafScore are more likely to be picked.
  const pickingPriorityQueue = new PriorityQueue<IFeedback>();

  filteredFeedbacks.forEach((feedback) => {
    pickingPriorityQueue.enqueue(
      feedback,
      1 / (1 + feedback.logafScore) + Math.random() // We add a random number to the weight to avoid picking the same feedbacks every time. The weight is 1 / (1 + logafScore) so that feedbacks with lower logafScore are more likely to be picked.
    );
    if (pickingPriorityQueue.size() > limit) {
      pickingPriorityQueue.dequeue();
    }
  });

  return pickingPriorityQueue.getItems();
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
  prompts: string[],
  verbose = true
): Promise<IFeedback[]> => {
  const feedbackPromises = prompts.map((prompt) =>
    model.callModelJSON<IFeedback[]>(prompt)
  );

  const feedbackResults = await Promise.allSettled(
    feedbackPromises.map(collectAndLogFeedback)
  );

  const feedbacks = extractFulfilledFeedbacks(feedbackResults);

  const bestFeedbacks = await pickBestFeedbacks(feedbacks, maxFeedbackCount);

  if (verbose) {
    console.log(formatFeedbacks(bestFeedbacks));
  }

  return bestFeedbacks;
};

export { createSummary, processFeedbacks };
