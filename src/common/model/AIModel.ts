import { OpenAIChat } from "langchain/llms/openai";
import { retryAsync } from "ts-retry";
import { logger } from "../utils/logger";
import { parseAndDecodeAttributes } from "../utils/parseAndDecodeAttributes";

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

  public async callModelJSON<T>(
    prompt: string,
    attributesToEncode: string[] = []
  ): Promise<T> {
    return retryAsync(
      async () => {
        const modelResponse = await this.model.call(prompt);
        try {
          // Use the utility function to parse and decode the specified attributes
          const parsedObject = parseAndDecodeAttributes<T>(
            modelResponse,
            attributesToEncode
          );
          return parsedObject;
        } catch (error) {
          logger.error(
            `Error parsing JSON response from the model: ${modelResponse}`,
            error
          );
          throw error;
        }
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
