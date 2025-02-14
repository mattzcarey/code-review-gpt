import { modelInfo } from '../../review/constants';
import { logger } from '../utils/logger';

const DEFAULT_MAX_PROMPT_LENGTH = 65536;

export const getMaxPromptLength = (modelName: string): number => {
  const maxPromptLength = modelInfo.find((info) => info.model === modelName)?.maxPromptLength;

  if (!maxPromptLength) {
    logger.warn(
      `Model ${modelName} not found in predefined list. Using default max prompt length (${DEFAULT_MAX_PROMPT_LENGTH} chars).`
    );
    return DEFAULT_MAX_PROMPT_LENGTH;
  }

  return maxPromptLength;
};
