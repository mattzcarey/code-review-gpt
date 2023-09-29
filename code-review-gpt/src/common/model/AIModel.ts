import { OpenAIChat } from "langchain/llms/openai";
import { retryAsync } from "ts-retry";

import { IFeedback } from "../types";
import { logger } from "../utils/logger";
import { parseAttributes } from "../utils/parseAttributes";

interface IAIModel {
  modelName: string;
  provider: string;
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
    switch (options.provider) {
      case "openai":
        this.model = new OpenAIChat({
          openAIApiKey: options.apiKey,
          modelName: options.modelName,
          temperature: options.temperature,
          configuration: { organization: options.organization },
        });
        break;
      case "bedrock":
        throw new Error("Bedrock provider not implemented");
      default:
        throw new Error("Provider not supported");
    }

    this.retryCount = options.retryCount || defaultRetryCount;
  }

  public async callModel(prompt: string): Promise<string> {
    return this.model.call(prompt);
  }

  public async callModelJSON(prompt: string): Promise<IFeedback[]> {
    return retryAsync(
      async () => {
        const modelResponse = await this.callModel(prompt);
        logger.debug(`Model response: ${modelResponse}`);
        try {
          // Use the utility function to parse and decode the specified attributes
          const parsedObject = parseAttributes(modelResponse);

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
