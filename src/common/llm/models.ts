import { createAnthropic } from '@ai-sdk/anthropic'
import { createAzure } from '@ai-sdk/azure'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createOpenAI } from '@ai-sdk/openai'
import type { LanguageModel, LanguageModelV1 } from 'ai'

type ProviderInstance = (modelId: string) => LanguageModel
type ProviderCreator = (options?: ModelCreationOptions) => ProviderInstance

const providerMap: Record<string, ProviderCreator> = {
  azure: createAzure,
  openai: createOpenAI,
  google: createGoogleGenerativeAI,
  anthropic: createAnthropic,
}

export interface ModelCreationOptions {
  baseURL?: string
  apiVersion?: string
}

// Internal helper to create the provider function
const createModelProvider = (
  providerKey: string,
  options: ModelCreationOptions
): ProviderInstance => {
  const creator = providerMap[providerKey]
  if (!creator) {
    throw new Error(
      `Unsupported provider: ${providerKey}. The supported providers are: ${Object.keys(providerMap).join(', ')}`
    )
  }
  if (providerKey === 'azure') {
    if (process.env.AZURE_API_VERSION) {
      options.apiVersion = process.env.AZURE_API_VERSION
    }
  }
  if (options) {
    return creator(options)
  }
  return creator()
}

export const createModel = (
  modelString: string,
  options?: ModelCreationOptions
): LanguageModelV1 => {
  const parts = modelString.split(':')
  if (parts.length !== 2) {
    throw new Error(
      'Invalid model string format. Expected "provider:modelName", e.g., "openai:gpt-4o"'
    )
  }
  const [providerKey, modelName] = parts
  const providerInstance = createModelProvider(providerKey, options ?? {})

  return providerInstance(modelName)
}
