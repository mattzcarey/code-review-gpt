import { ChatOpenAI, AzureChatOpenAI } from "@langchain/openai";
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
  private model: ChatOpenAI;
  private retryCount: number;

  constructor(options: IAIModel) {
    switch (options.provider) {
      case "openai":
        this.model = new ChatOpenAI({
          openAIApiKey: options.apiKey,
          modelName: options.modelName,
          temperature: options.temperature,
          configuration: { organization: options.organization },
        });
        break;
      case "bedrock":
        throw new Error("Bedrock provider not implemented");
      case "azure":
        this.model = new AzureChatOpenAI({
          openAIApiKey: options.apiKey,
          modelName: options.modelName,
          temperature: options.temperature,
          configuration: { organization: options.organization },
        });
      default:
        throw new Error("Provider not supported");
    }

    this.retryCount = options.retryCount || defaultRetryCount;
  }

  public async callModel(prompt: string): Promise<string> {
    const messages = [{ role: "user", content: prompt }];
    const response = await this.model.invoke(messages);
    if (typeof response.content === 'string') {
      return response.content;
    } else {
      throw new Error('Response content is not a string');
    }
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
