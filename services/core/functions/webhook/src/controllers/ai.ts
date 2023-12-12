import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { OpenAIChat } from "langchain/llms/openai";
import { modelInfo } from "../constants";

interface IAIModel {
  modelName: string;
  apiKey: string;
  temperature: number;
  organization?: string;
}

export class AIModel {
  private model: OpenAIChat;
  private modelName: string;
  public embeddings: OpenAIEmbeddings;

  constructor(options: IAIModel) {
    this.modelName = options.modelName;
    this.model = new OpenAIChat({
      openAIApiKey: options.apiKey,
      modelName: options.modelName,
      temperature: options.temperature,
      configuration: { organization: options.organization },
    });
    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: options.apiKey,
      configuration: { organization: options.organization },
    });
  }

  public getMaxPromptLength = (): number => {
    const model = modelInfo.find((info) => info.model === this.modelName);
    if (!model) {
      throw new Error(
        `Model ${this.modelName} not found. Please update constants.ts to use this valid model.`
      );
    }

    return model.maxPromptLength;
  };

  public async callModel(prompt: string): Promise<string> {
    try {
      const res = await this.model.call(prompt);
      console.debug(`Response from AI model: ${res}`);

      return res;
    } catch (error) {
      throw new Error(`Error calling AI model: ${(error as Error).message}`);
    }
  }
}
