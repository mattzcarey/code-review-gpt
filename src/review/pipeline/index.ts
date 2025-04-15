import type { ConfiguredModel } from '../../common/llm/models';
import type { AskAIResponse } from '../../common/types';
import { logger } from '../../common/utils/logger';
import { markdownReport } from '../formatting/markdownReport';
import { fetchAndProcessFeedback } from './feedbackProcessor';

export const reviewPipeline = async (
  prompts: string[],
  model: ConfiguredModel
): Promise<AskAIResponse> => {
  logger.info('Asking the experts...');

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
