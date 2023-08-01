import { OpenAIChat } from "langchain/llms/openai";
import { retryAsync } from "ts-retry";
import { logger } from "../utils/logger";

interface IAIModel {
  modelName: string;
  temperature: number;
  apiKey: string;
  retryCount?: number;
}

const defaultRetryCount = 3;

class AIModel {
  private model: OpenAIChat;
  private retryCount: number;

  constructor(options: IAIModel) {
    this.model = new OpenAIChat({
      openAIApiKey: options.apiKey,
      modelName: options.modelName,
      temperature: options.temperature,
    });
    this.retryCount = options.retryCount || defaultRetryCount;
  }

  public async callModel(prompt: string): Promise<string> {
    return this.model.call(prompt);
  }

  public async callModelJSON<T>(prompt: string): Promise<T> {
    return retryAsync(
      async () => {
        const modelResponse = await this.model.call(prompt);
        return JSON.parse(modelResponse) as T;
      },
      {
        maxTry: this.retryCount,
        onError: (error) => {
          logger.error(`Error in callModelJSON`, error);
        },
        onMaxRetryFunc: () => {
          throw new Error(
            `Couldn't call model after ${this.retryCount} tries with prompt: ${prompt}`
          );
        },
      }
    );
  }
}

export default AIModel;
