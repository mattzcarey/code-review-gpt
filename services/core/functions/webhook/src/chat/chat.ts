/* eslint-disable max-depth */
/* eslint-disable complexity */
// Reviewing multiple files inline > prioritising them > adding review comments
// Answer questions > get the comments on the PR (by me and the questioner) as context > answer the question as comment

import jsesc from "jsesc";

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

    if (prompt.length > maxPromptLength) {
      console.error(
        `File ${prompt} is too large to review, skipping review for this file`
      );

      return undefined;
    }

    try {
      let jsonResponse = await this.ai.callModel(prompt);
      jsonResponse = removeMarkdownJsonQuotes(jsonResponse);

      try {
        return JSON.parse(jsonResponse) as ReviewFile[];
      } catch (parseError) {
        console.error(
          `Error parsing JSON: ${
            (parseError as Error).message
          }. Escaping special characters and retrying.`
        );

        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
          const escapedJsonResponse: string = jsesc(jsonResponse, {
            json: true,
          });

          return JSON.parse(escapedJsonResponse) as ReviewFile[];
        } catch (escapeParseError) {
          console.error(
            `Error parsing escaped JSON: ${
              (escapeParseError as Error).message
            }. Returning undefined.`
          );

          return undefined;
        }
      }
    } catch (error) {
      console.error(
        `Error processing review data: ${(error as Error).message}`
      );

      return undefined;
    }
  };
}

const removeMarkdownJsonQuotes = (jsonString: string): string => {
  return jsonString
    .replace(/^`+\s*json\s*/, "")
    .replace(/\s*`+$/, "")
    .trim();
};
