/* eslint-disable complexity */
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

    //call model
    const jsonResponse = await this.ai.callModel(prompt);

    //trim the response to remove the ```json tags
    const cleanJsonResponse = removeMarkdownJsonQuotes(jsonResponse);

    // several strategies to try to parse the json
    try {
      //try to parse the json normally
      let reviewData: ReviewFile[];
      try {
        reviewData = JSON.parse(cleanJsonResponse) as ReviewFile[];
      } catch (error) {
        console.error(
          `Error parsing JSON from AI: ${
            (error as Error).message
          }. Trying to recover.`
        );
      }

      //if we failed to parse the json, try to fix it
      let encodedJsonResponse: string;
      let decodedReviewData: ReviewFile[];

      //encoding the Suggested Code and Code Snippet fields in base64
      try {
        encodedJsonResponse = encodeCodeInJson(jsonResponse);
      } catch (error) {
        throw new Error(`Error encoding JSON: ${(error as Error).message}.`);
      }

      //try to parse the json again
      try {
        reviewData = JSON.parse(encodedJsonResponse) as ReviewFile[];
      } catch (error) {
        throw new Error(
          `Error parsing encoded JSON from AI: ${(error as Error).message}.`
        );
      }

      // decoding the Suggested Code and Code Snippet fields from base64
      try {
        decodedReviewData = decodeCodeInReviewData(reviewData);
      } catch (error) {
        throw new Error(`Error decoding JSON: ${(error as Error).message}.`);
      }

      return decodedReviewData;
    } catch (error) {
      // Last chance... Failed to encode and decode the suggestions. Set them to "" and then parse the json.
      try {
        return JSON.parse(
          removeSuggestionsFromJSON(cleanJsonResponse)
        ) as ReviewFile[];
      } catch (fixError) {
        console.error(
          `Error fixing JSON from AI: ${
            (fixError as Error).message
          }. Returning undefined.`
        );

        return undefined;
      }
    }
  };
}

const removeMarkdownJsonQuotes = (jsonString: string): string => {
  return jsonString
    .replace(/^`+json[\s\S]*?\[/, "[")
    .replace(/\]`+$/, "]")
    .trim();
};

const removeSuggestionsFromJSON = (jsonString: string): string => {
  return jsonString.replace(/("suggestedCode":\s*").+?(",)/g, '$1""$2');
};

const encodeCodeInJson = (jsonString: string): string => {
  return jsonString.replace(
    /("suggestedCode":\s*")(.+?)(",|"codeSnippet":)/g,
    (p1: string, p2: string, p3: string) => {
      const encodedCode = Buffer.from(p2).toString("base64");

      return p1 + encodedCode + p3;
    }
  );
};

const decodeCodeInReviewData = (reviewData: ReviewFile[]): ReviewFile[] => {
  reviewData.forEach((review) => {
    if (review.suggestedCode) {
      review.suggestedCode = Buffer.from(
        review.suggestedCode,
        "base64"
      ).toString("utf-8");
    }
    if (review.codeSnippet) {
      review.codeSnippet = Buffer.from(review.codeSnippet, "base64").toString(
        "utf-8"
      );
    }
  });

  return reviewData;
};
