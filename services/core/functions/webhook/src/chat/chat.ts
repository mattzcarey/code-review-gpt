// Reviewing multiple files inline > prioritising them > adding review comments
// Answer questions > get the comments on the PR (by me and the questioner) as context > answer the question as comment

import { modelInfo } from "../constants";
import { AIModel } from "../llm/ai";

export class Chat {
  ai: AIModel;
  modelName: string;
  constructor(
    openaiApiKey: string,
    openaiModelName?: string,
    temperature?: string
  ) {
    this.modelName = openaiModelName ?? "gpt-4";
    this.ai = new AIModel({
      modelName: this.modelName,
      apiKey: openaiApiKey,
      temperature: temperature ? parseFloat(temperature) : 0,
    });
  }

  private getMaxPromptLength = (modelName: string): number => {
    const model = modelInfo.find((info) => info.model === modelName);
    if (!model) {
      throw new Error(`Model ${modelName} not found`);
    }

    return model.maxPromptLength;
  };

  public getReview = async (prompt: string): Promise<string | undefined> => {
    const maxPromptLength = this.getMaxPromptLength(this.modelName);

    // TODO: fix this hack
    if (prompt.length > maxPromptLength) {
      console.error(
        `File ${prompt} is too large to review, skipping review for this file`
      );

      return undefined;
    }
    try {
      return await this.ai.callModel(prompt);
    } catch (error) {
      throw new Error(`Error fetching review: ${(error as Error).message}`);
    }
  };
}
