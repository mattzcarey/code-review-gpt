// Reviewing multiple files inline > prioritising them > adding review comments
// Answer questions > get the comments on the PR (by me and the questioner) as context > answer the question as comment

import { modelInfo } from "../constants";
import { AIModel } from "../llm/ai";
import { buildReviewPrompt } from "../prompts/buildPrompt";
import { ReviewFile } from "../types";

export class Chat {
  ai: AIModel;
  modelName: string;
  constructor(
    openaiApiKey: string,
    openaiModelName?: string,
    temperature?: string
  ) {
    this.modelName = openaiModelName ?? "gpt-4-1106-preview";
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

  public getReview = async (
    patch: string
  ): Promise<ReviewFile[] | undefined> => {
    const prompt = buildReviewPrompt(patch);
    const maxPromptLength = this.getMaxPromptLength(this.modelName);

    // TODO: fix this hack
    if (prompt.length > maxPromptLength) {
      console.error(
        `File ${prompt} is too large to review, skipping review for this file`
      );

      return undefined;
    }
    try {
      const jsonResponse = await this.ai.callModel(prompt);

      if (!jsonResponse) {
        throw new Error("No review json data returned by AI");
      }

      return JSON.parse(jsonResponse) as ReviewFile[];
    } catch (error) {
      throw new Error(`Error fetching review: ${(error as Error).message}`);
    }
  };
}
