import { ChatOpenAI } from "@langchain/openai";

import { ZodType } from "zod";
import type { IFeedback } from '../types';
import { logger } from "../utils/logger";

interface IAIModel {
  modelName: string;
  provider: string;
  temperature: number;
  apiKey: string;
  retryCount?: number;
  organization: string | undefined;
}

export class AIModel {
  private model: ChatOpenAI;

  constructor(options: IAIModel) {
    switch (options.provider) {
      case 'openai':
        this.model = new ChatOpenAI({
          apiKey: options.apiKey,
          ...(options.organization && { organization: options.organization }),
          temperature: options.temperature,
          modelName: options.modelName,
        });
        break;
      case 'bedrock':
        throw new Error('Bedrock provider not implemented');
      default:
        throw new Error('Provider not supported');
    }
  }

  public async callModel(prompt: string): Promise<string> {
    const message = await this.model.invoke(prompt);
    return message.content[0] as string;
  }

  public async callStructuredModel(prompt: string, schema: ZodType): Promise<IFeedback[]> {
    const modelWithStructuredOutput = this.model.withStructuredOutput(schema,{
      method: "jsonSchema",
      strict: true,
      includeRaw: true
    });
    const res = await modelWithStructuredOutput.invoke(prompt)

    logger.debug("LLm response", res);

    if (res.parsed) {
      return res.parsed
    }

    return parseJson(res.raw.content[0] as string)
}}


const parseJson = (json: string) => {
  logger.debug("Unparsed JSON", json);
  
  const jsonString = json
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')     // Windows line endings
    .replace(/\t/g, '\\t')     // Tabs
    .replace(/```/g, '\\`\\`\\`')
    .replace(/`/g, '\\`')
    .replace(/"/g, '\\"')
    .replace(/\\/g, '\\\\')    // Backslashes
    .replace(/\f/g, '\\f')     // Form feeds
    .replace(/\b/g, '\\b')     // Backspace
    .replace(/\u2028/g, '\\u2028')  // Line separator
    .replace(/\u2029/g, '\\u2029'); // Paragraph separator
  
  logger.debug("Escaped JSON", jsonString);
  return JSON.parse(jsonString);
};
