import type { AIModel } from '../../common/model/AIModel';
import type { IFeedback } from '../../common/types';
import { logger } from '../../common/utils/logger';
import { feedbackSchema } from '../prompt/schemas';
import PriorityQueue from './PriorityQueue';

const collectAndLogFeedback = async (
  feedbackPromise: Promise<IFeedback[]>
): Promise<IFeedback[]> => {
  try {
    const feedbacks = await feedbackPromise;

    return feedbacks;
  } catch (error) {
    logger.error('Error in processing prompt', error);
    throw error;
  }
};

// added some filtering to the feedbacks
export const processFeedback = (feedbacks: IFeedback[]): IFeedback[] => {
  const pickingPriorityQueue = new PriorityQueue<IFeedback>();
  const filteredFeedbacks = feedbacks.filter(
    (feedback) => feedback.riskScore > 1 && feedback.confidence > 3
  );

  for (const feedback of filteredFeedbacks) {
    pickingPriorityQueue.enqueue(feedback, feedback.riskScore * feedback.confidence);
  }

  return pickingPriorityQueue.getItems();
};

const extractFulfilledFeedbacks = (
  feedbackResults: PromiseSettledResult<IFeedback[]>[]
): IFeedback[] => {
  return feedbackResults.reduce<IFeedback[]>((accumulatedFeedbacks, feedbackResult) => {
    if (feedbackResult.status === 'fulfilled') {
      return accumulatedFeedbacks.concat(feedbackResult.value);
    }
    return accumulatedFeedbacks;
  }, []);
};

export const processFeedbacks = async (model: AIModel, prompts: string[]): Promise<IFeedback[]> => {
  const feedbackPromises = prompts.map((prompt) =>
    model.callStructuredModel(prompt, feedbackSchema)
  );

  const feedbackResults = await Promise.allSettled(feedbackPromises.map(collectAndLogFeedback));

  const feedbacks = extractFulfilledFeedbacks(feedbackResults);

  return processFeedback(feedbacks);
};
