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
      let jsonResponse = await this.ai.callModel(prompt);

      jsonResponse = jsonResponse.replace(/```json\n?|```/g, "").trim();
      jsonResponse = encodeCodeInJson(jsonResponse);

      const reviewData = JSON.parse(jsonResponse) as ReviewFile[];
      const decodedReviewData = decodeCodeInReviewData(reviewData);

      return decodedReviewData;
    } catch (error) {
      // assume we failed to encode and decode the code snippets. Set them to "" and then parse the json.
      console.log(
        `Error encoding, decoding and parsing JSON: ${
          (error as Error).message
        }. Now removing code suggestions and trying again.`
      );
      try {
        let jsonResponse = await this.ai.callModel(prompt);

        jsonResponse = jsonResponse.replace(/```json\n?|```/g, "").trim();
        jsonResponse = removeSuggestionsFromJSON(jsonResponse);

        return JSON.parse(jsonResponse) as ReviewFile[];
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
