//import PriorityQueue from "./PriorityQueue";
import { formatFeedbacks } from "./generateMarkdownReport";
import AIModel from "../../common/model/AIModel";
import { IFeedback, ReviewFile } from "../../common/types";
import { logger } from "../../common/utils/logger";
import { constructPromptsArray } from "../prompt/constructPrompt/constructPrompt";
import { completionPrompt } from "../prompt/prompts";

export interface Review {
  files:ReviewFile[];
  maxPromptLength:number;
  reviewType:string;
}

const collectAndLogFeedback = async (
  feedbackPromise: Promise<IFeedback[]>
): Promise<IFeedback[]> => {
  try {
    const feedbacks = await feedbackPromise;

    return feedbacks;
  } catch (error) {
    logger.error(`Error in processing prompt`, error);
    throw error;
  }
};

const createSummary = async (
  model: AIModel,
  feedbacks: IFeedback[]
): Promise<string> => {
  const finalPrompt = completionPrompt.replace(
    "{feedback}",
    JSON.stringify(feedbacks)
  );

  const summary = await model.callModel(finalPrompt);

  logger.info(summary);

  return summary;
};

//TODO: delete?
// const pickWorstFeedbacks = (
//   feedbacks: IFeedback[],
//   limit: number
// ): IFeedback[] => {
//   const pickingPriorityQueue = new PriorityQueue<IFeedback>();

//   //remove feedbacks with risk score of 1 from consideration.
//   const filteredFeedbacks = feedbacks.filter(
//     (feedback) => feedback.riskScore > 1
//   );

//   filteredFeedbacks.forEach((feedback) => {
//     pickingPriorityQueue.enqueue(
//       feedback,
//       feedback.riskScore + Math.random() // We add a random number to the weight to avoid picking the same feedbacks every time. The weight is the risk score itself, so that feedbacks with higher risk scores are more likely to be picked.
//     );
//     if (pickingPriorityQueue.size() > limit) {
//       pickingPriorityQueue.dequeue();
//     }
//   });

//   return pickingPriorityQueue.getItems();
// };

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
  review:Review
): Promise<IFeedback[]> => {

  const largeFilesFeedback:IFeedback[] = [];

  const prompts = constructPromptsArray(
    review.files,
    review.maxPromptLength,
    review.reviewType,
    (largeFile)=>{
      const firstLine = largeFile.promptContent.split("\n")[0];
      largeFilesFeedback.push({details:"\n **The file is too large for GPT Code review. Please review it manually** \n",fileName:largeFile.fileName,line:firstLine,riskScore:6});
    }
  );

  const feedbackPromises = prompts.map((prompt) =>
    model.callModelJSON(prompt)
  );

  const feedbackResults = await Promise.allSettled(
    feedbackPromises.map(collectAndLogFeedback)
  );

  const feedbacks = extractFulfilledFeedbacks(feedbackResults);

  //TODO: allow posting those with score 1?
  const worstFeedbacks  = feedbacks.filter(
    (feedback) => feedback.riskScore > 1
  );
  
  
  //= pickWorstFeedbacks(feedbacks, maxFeedbackCount);

  logger.info(formatFeedbacks(worstFeedbacks));

  return worstFeedbacks.concat(largeFilesFeedback);
};

export { createSummary, processFeedbacks };
