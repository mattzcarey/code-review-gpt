import { AIModel } from '../../common/model/AIModel';
import type { AskAIResponse } from '../../common/types';
import { logger } from '../../common/utils/logger';
import { markdownReport } from '../formatting/markdownReport';
import { fetchAndProcessFeedback } from './feedbackProcessor';

export const reviewPipeline = async (
  prompts: string[],
  modelName: string,
  openAIApiKey: string,
  organization: string | undefined,
  provider: string
): Promise<AskAIResponse> => {
  logger.info('Asking the experts...');

  const model = new AIModel({
    modelName: modelName,
    temperature: 0.0,
    apiKey: openAIApiKey,
    organization,
    provider,
  });

  const feedbacks = await fetchAndProcessFeedback(model, prompts);

  if (feedbacks.length === 0) {
    return {
      markdownReport: 'No issues found in PR 🎉',
      feedbacks: [],
    };
  }

  const report = markdownReport(feedbacks);

  return {
    markdownReport: report,
    feedbacks,
  };
};
