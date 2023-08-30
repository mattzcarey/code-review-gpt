import { OpenAIChat } from "langchain/llms/openai";
import { retryAsync } from "ts-retry";
import { logger } from "../utils/logger";
import { parseAttributes } from "../utils/parseAttributes";

interface IAIModel {
  modelName: string;
  temperature: number;
  apiKey: string;
  retryCount?: number;
  organization: string | undefined;
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
      configuration: { organization: options.organization },
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
        logger.debug(`Model response: ${modelResponse}`);
        try {
          // Use the utility function to parse and decode the specified attributes
          const parsedObject = parseAttributes<T>(
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
