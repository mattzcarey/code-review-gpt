import { OpenAIChat } from "langchain/llms/openai";

interface IAIModel {
  modelName: string;
  temperature: number;
  apiKey: string;
}

class AIModel {
  private model: OpenAIChat;

  constructor(options: IAIModel) {
    this.model = new OpenAIChat({
      openAIApiKey: options.apiKey,
      modelName: options.modelName,
      temperature: options.temperature,
    });
  }

  public async callModel(prompt: string): Promise<string> {
    return this.model.call(prompt);
  }
}

export default AIModel;
