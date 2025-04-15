import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import type { LanguageModel, LanguageModelV1 } from 'ai';
import { generateObject, generateText } from 'ai';
import type { ZodSchema } from 'zod';

// Type for the function returned by createOpenAI, etc.
// Takes modelId, returns the LanguageModel object.
type ProviderInstance = (modelId: string) => LanguageModel;

// Type for the creator functions themselves (createOpenAI, etc.)
// Takes options, returns the ProviderInstance function.
type ProviderCreator = (options?: Record<string, unknown>) => ProviderInstance;

const providerMap: Record<string, ProviderCreator> = {
  openai: createOpenAI,
  google: createGoogleGenerativeAI,
  anthropic: createAnthropic,
};

export interface ModelCreationOptions {
  baseURL?: string;
}

// Internal helper to create the provider function
const createModelProvider = (
  providerKey: string,
  options?: ModelCreationOptions
): ProviderInstance => {
  const creator = providerMap[providerKey];
  if (!creator) {
    throw new Error(`Unsupported provider: ${providerKey}`);
  }
  if (options?.baseURL) {
    return creator({ baseURL: options.baseURL });
  }
  return creator();
};

export const createModel = (
  modelString: string,
  options?: ModelCreationOptions
): LanguageModelV1 => {
  const parts = modelString.split(':');
  if (parts.length !== 2) {
    throw new Error(
      'Invalid model string format. Expected "provider:modelName", e.g., "openai:gpt-4o"'
    );
  }
  const [providerKey, modelName] = parts;
  const providerInstance = createModelProvider(providerKey, options);

  return providerInstance(modelName);
};
