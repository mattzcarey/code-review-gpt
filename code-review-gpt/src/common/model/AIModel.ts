import { OpenAIChat } from "langchain/llms/openai";
import { retryAsync } from "ts-retry";

import { getLanguageName } from "../../review/prompt/getLanguageOfFile";
import { instructionPrompt } from "../../review/prompt/prompts";
import { IFeedback, PromptFile } from "../types";
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

  public async callModelJSON(files: PromptFile[]): Promise<IFeedback[]> {
    const prompt =
      instructionPrompt.replace("{Language}", getLanguageName(files)) +
      JSON.stringify(files);

    const modelResponse = await retryAsync(
      async () => {
        logger.debug(`Calling the model to review files: ${JSON.stringify(files.map(file=>file.fileName))}`);
        const modelResponse = await this.callModel(prompt);
        logger.debug(`Model response: ${modelResponse}`);

        return modelResponse;
      },
      {
        maxTry: this.retryCount,
        delay: 5000,
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

    try {
      // Use the utility function to parse and decode the specified attributes
      const parsedObject = parseAttributes(modelResponse);

      return parsedObject;

    } catch (error) {

      logger.error(`Can't parse response from the model for following files: ${JSON.stringify(files.map(file=>file.fileName))}`, error);
    
      if (files.length === 1) {
        logger.error(`Creating error feedback for the file ${files[0].fileName}`);

        return this.constructErrorFeedback(files[0]);
      } else {
        logger.error("Splitting these files into 2 groups...");

        //split the files into 2 sets, run recursively the same method and join their result
        //It is required because the model may crash on a bunch of let say 7 files because it can't understand only one
        const splitIndex = Math.floor(files.length / 2);

        //TODO - run in parallel
        const feedback1 = await this.callModelJSON(files.slice(0, splitIndex));
        const feedback2 = await this.callModelJSON(files.slice(splitIndex));

        return feedback1.concat(feedback2);
      }
    }
  }

  constructErrorFeedback(file: PromptFile): IFeedback[] {

    const firstLine = file.promptContent.split("\n")[0];

    return [
      {
        details:
          "\n **GPT Code review was not able to understand this file. Please review it manually!** \n",
        fileName: file.fileName,
        line: firstLine,
        riskScore: 6,
      },
    ];
  }
}

export default AIModel;
