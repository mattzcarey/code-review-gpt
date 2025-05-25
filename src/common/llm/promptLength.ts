import { logger } from '../utils/logger'

export const modelInfo = [
  {
    model: 'openai:o3',
    maxPromptLength: 300000, //100k tokens
  },
  {
    model: 'openai:o3-mini',
    maxPromptLength: 300000, //100k tokens
  },
  {
    model: 'openai:o4-mini',
    maxPromptLength: 300000, //100k tokens
  },
  {
    model: 'openai:o1',
    maxPromptLength: 300000, //100k tokens
  },
  {
    model: 'openai:gpt-4o-mini',
    maxPromptLength: 300000, //128k tokens
  },
  {
    model: 'openai:gpt-4o',
    maxPromptLength: 300000, //128k tokens
  },
  {
    model: 'openai:gpt-4.1',
    maxPromptLength: 2400000, //1024k tokens (1M context window)
  },
  {
    model: 'openai:gpt-4.1-mini',
    maxPromptLength: 2400000, //1024k tokens (1M context window)
  },
  {
    model: 'openai:gpt-4.1-nano',
    maxPromptLength: 2400000, //1024k tokens (1M context window)
  },
  {
    model: 'openai:gpt-4-turbo',
    maxPromptLength: 300000, //128k tokens
  },
  {
    model: 'openai:gpt-4-turbo-preview',
    maxPromptLength: 300000, //128k tokens
  },
  {
    model: 'openai:gpt-4',
    maxPromptLength: 21000, //8k tokens
  },
  {
    model: 'openai:gpt-4-32k',
    maxPromptLength: 90000, //32k tokens
  },
  {
    model: 'openai:gpt-3.5-turbo',
    maxPromptLength: 45000, //16k tokens
  },
  {
    model: 'openai:gpt-3.5-turbo-16k',
    maxPromptLength: 45000, //16k tokens
  },
] // Response needs about 1k tokens ~= 3k characters

const DEFAULT_MAX_PROMPT_LENGTH = 65536

export const getMaxPromptLength = (modelName: string): number => {
  const maxPromptLength = modelInfo.find(
    (info) => info.model === modelName
  )?.maxPromptLength

  if (!maxPromptLength) {
    logger.warn(
      `Model ${modelName} not found in predefined list. Using default max prompt length (${DEFAULT_MAX_PROMPT_LENGTH} chars).`
    )
    return DEFAULT_MAX_PROMPT_LENGTH
  }

  return maxPromptLength
}
