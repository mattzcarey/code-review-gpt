import { ChatOpenAI, AzureChatOpenAI } from '@langchain/openai';
import { OpenAI as DeepSeekAI } from 'openai';
import type { ZodType } from 'zod';
import type { IFeedback } from '../types';
import { logger } from '../utils/logger';
import type { AIModelName } from '../../review/constants';
import type { ProviderOptions } from '../../common/types';

interface IAIModel {
  modelName: AIModelName;
  provider: ProviderOptions;
  temperature: number;
  apiKey: string;
  retryCount?: number;
  organization?: string;
}

export class AIModel {
  private model: ChatOpenAI | ReturnType<typeof createDeepSeekModel>;

  constructor(options: IAIModel) {
    switch (options.provider) {
      case 'openai':
        this.model = new ChatOpenAI({
          apiKey: options.apiKey,
          ...(options.organization && { organization: options.organization }),
          temperature: options.temperature,
          modelName: options.modelName,
        });
        break;
      case 'azureai':
        this.model = new AzureChatOpenAI({
          temperature: options.temperature,
        });
        break;
      case 'deepseek':
        this.model = createDeepSeekModel({
          apiKey: options.apiKey,
          baseURL: 'https://api.deepseek.com',
          temperature: options.temperature,
          model: options.modelName as Extract<AIModelName, `deepseek-${string}`>,
        });
        break;
      case 'bedrock':
        throw new Error('Bedrock provider not implemented');
      default:
        throw new Error('Provider not supported');
    }
  }

  public async callModel(prompt: string): Promise<string> {
    if ('callModel' in this.model) {
      return this.model.callModel(prompt);
    } else {
      const message = await this.model.invoke(prompt);
      return message.content[0] as string;
    }
  }

  public async callStructuredModel(prompt: string, schema: ZodType): Promise<IFeedback[]> {
    if ('callStructuredModel' in this.model) {
      return this.model.callStructuredModel(prompt);
    } else {
      const modelWithStructuredOutput = this.model.withStructuredOutput(schema, {
        method: 'jsonSchema',
        strict: true,
        includeRaw: true,
      });
      const res = await modelWithStructuredOutput.invoke(prompt);

      logger.debug('LLm response', res);

      if (res.parsed) {
        return res.parsed;
      }

      return parseJson(res.raw.content[0] as string);
    }
  }
}

const parseJson = (json: string) => {
  logger.debug('Unparsed JSON', json);

  const jsonString = json
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
    .replace(/```/g, '\\`\\`\\`')
    .replace(/`/g, '\\`')
    .replace(/"/g, '\\"')
    .replace(/\f/g, '\\f')
    .replace(/\b/g, '\\b')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');

  logger.debug('Escaped JSON', jsonString);
  return JSON.parse(jsonString);
};

interface DeepSeekOptions {
  apiKey: string;
  baseURL: string;
  temperature: number; // https://api-docs.deepseek.com/quick_start/parameter_settings  0.0 | 1.0 | 1.3 | 1.5
  model: Extract<AIModelName, `deepseek-${string}`>;
}

function createDeepSeekModel(options: DeepSeekOptions) {
  const { apiKey, baseURL, temperature = 1.0, model } = options;

  const client = new DeepSeekAI({ baseURL, apiKey });

  return {
    callModel: async (prompt: string) => {
      const completion = await client.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model,
        temperature,
      });
      return completion.choices[0].message.content as string;
    },

    callStructuredModel: async (prompt: string): Promise<IFeedback[]> => {
      const completion = await client.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model,
        temperature,
      });
      const content = completion.choices[0].message.content;
      return parseJson(content as string);
    },
  };
}
