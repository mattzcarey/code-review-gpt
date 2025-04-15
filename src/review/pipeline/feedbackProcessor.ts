import type { AIModel } from '../../common/model/AIModel';
import type { IFeedback } from '../../common/types';
import { logger } from '../../common/utils/logger';
import { feedbackSchema } from '../prompt/schemas';
import PriorityQueue from './PriorityQueue';

// Helper to wrap individual AI calls and log errors
const collectAndLogFeedback = async (
  feedbackPromise: Promise<IFeedback[]>,
  promptIndex: number // Add index for better logging
): Promise<IFeedback[]> => {
  try {
    const feedbacks = await feedbackPromise;
    return feedbacks;
  } catch (error) {
    // Log which specific prompt failed
    logger.error(`Error processing prompt index ${promptIndex}:`, error);
    // Re-throw to allow Promise.allSettled to catch it as rejected
    throw error;
  }
};

// Filter feedbacks based on thresholds
const filterFeedback = (feedbacks: IFeedback[]): IFeedback[] => {
  return feedbacks.filter((feedback) => feedback.riskScore > 1 && feedback.confidence > 3);
};

// Prioritize feedbacks using a PriorityQueue
const prioritizeFeedback = (feedbacks: IFeedback[]): IFeedback[] => {
  const pickingPriorityQueue = new PriorityQueue<IFeedback>();
  for (const feedback of feedbacks) {
    // Use riskScore * confidence as the priority value
    pickingPriorityQueue.enqueue(feedback, feedback.riskScore * feedback.confidence);
  }
  return pickingPriorityQueue.getItems();
};

// Helper to extract fulfilled feedbacks from settled promises
const extractFulfilledFeedbacks = (
  feedbackResults: PromiseSettledResult<IFeedback[]>[]
): { fulfilled: IFeedback[]; rejectedCount: number } => {
  let rejectedCount = 0;
  const fulfilled = feedbackResults.reduce<IFeedback[]>((accumulatedFeedbacks, feedbackResult) => {
    if (feedbackResult.status === 'fulfilled') {
      return accumulatedFeedbacks.concat(feedbackResult.value);
    }
    // Log reason for rejection if needed (already logged in collectAndLogFeedback)
    // logger.warn(`Prompt failed: ${feedbackResult.reason}`);
    rejectedCount++;
    return accumulatedFeedbacks;
  }, []);
  return { fulfilled, rejectedCount };
};

// Renamed function: Fetches feedback from AI and processes it
export const fetchAndProcessFeedback = async (
  model: AIModel,
  prompts: string[]
): Promise<IFeedback[]> => {
  // Map prompts to AI calls, passing index for logging
  const feedbackPromises = prompts.map((prompt, index) =>
    collectAndLogFeedback(model.callStructuredModel(prompt, feedbackSchema), index)
  );

  // Run all calls concurrently and wait for settlement
  const feedbackResults = await Promise.allSettled(feedbackPromises);

  // Extract fulfilled results and count rejected ones
  const { fulfilled: collectedFeedbacks, rejectedCount } =
    extractFulfilledFeedbacks(feedbackResults);

  if (rejectedCount > 0) {
    logger.warn(`${rejectedCount} out of ${prompts.length} prompts failed to get feedback.`);
  }

  // Filter and prioritize the successfully retrieved feedbacks
  const filtered = filterFeedback(collectedFeedbacks);
  const prioritized = prioritizeFeedback(filtered);

  return prioritized;
};
