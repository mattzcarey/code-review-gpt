// Answer questions > get the comments on the PR (by me and the questioner) as context > answer the question as comment
import jsesc from "jsesc";

import { buildReviewPrompt } from "../../prompts/buildPrompt";
import { ReviewFile } from "../../types";
import { AIModel } from "../ai";

export class Chat {
  ai: AIModel;
  constructor(ai: AIModel) {
    this.ai = ai;
  }

  public getReview = async (
    patch: string
  ): Promise<ReviewFile[] | undefined> => {
    const prompt = buildReviewPrompt(patch);
    const maxPromptLength = this.ai.getMaxPromptLength();

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

  public getAnswer = async (question: string): Promise<string | undefined> => {
    try {
      return await this.ai.callModel(question);
    } catch (error) {
      console.error(`Error processing question: ${(error as Error).message}`);

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
