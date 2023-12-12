/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Context } from "probot";

import { AIModel } from "../ai";
import { Chat } from "./chat";
import { getAPIKeyFromGH } from "./variables/apiKey";
import { getOptionalVariablesFromGH } from "./variables/optional";

export const loadPR = async (
  context: Context<
    "pull_request.opened" | "pull_request.synchronize" | "pull_request.reopened"
  >
): Promise<Chat> => {
  // Get variables from GitHub
  // @ts-ignore
  const apiKey = await getAPIKeyFromGH(context);
  const optionalVariables = await getOptionalVariablesFromGH(
    ["OPENAI_MODEL_NAME", "TEMPERATURE"],
    context
  );

  const ai = new AIModel({
    modelName: optionalVariables.OPENAI_MODEL_NAME ?? "gpt-4-1106-preview",
    apiKey,
    temperature: optionalVariables.temperature
      ? parseFloat(optionalVariables.temperature)
      : 0,
  });

  return new Chat(ai);
};

export const loadQA = async (
  context: Context<"pull_request_review_thread">
): Promise<Chat> => {
  // Get variables from GitHub
  const apiKey = await getAPIKeyFromGH(context);
  const optionalVariables = await getOptionalVariablesFromGH(
    ["OPENAI_MODEL_NAME", "TEMPERATURE"],
    context
  );

  const ai = new AIModel({
    modelName: optionalVariables.OPENAI_MODEL_NAME ?? "gpt-4-1106-preview",
    apiKey,
    temperature: optionalVariables.temperature
      ? parseFloat(optionalVariables.temperature)
      : 0,
  });

  return new Chat(ai);
};
