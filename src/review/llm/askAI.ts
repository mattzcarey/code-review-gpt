import { AIModel } from '../../common/model/AIModel';
import type { AskAIResponse } from '../../common/types';
import { logger } from '../../common/utils/logger';
import { processFeedbacks } from './feedbackProcessor';
import { markdownReport } from './generateMarkdownReport';
import { AIModelName } from '../constants';

import type { ProviderOptions } from '../../common/types';

export const askAI = async (
  prompts: string[],
  modelName: AIModelName,
  openAIApiKey: string,
  organization: string | undefined,
  provider: ProviderOptions
): Promise<AskAIResponse> => {
  logger.info('Asking the experts...');

  const model = new AIModel({
    modelName: modelName,
    temperature: 0.0,
    apiKey: openAIApiKey,
    organization,
    provider,
  });

  const feedbacks = await processFeedbacks(model, prompts);

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
