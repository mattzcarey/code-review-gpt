import { Context } from "probot";

import { AIModel } from "../ai";
import { VectorDatabase } from "../db";
import { Chat } from "./chat";
import { getAPIKeyFromGH } from "./variables/apiKey";
import { getOptionalVariablesFromGH } from "./variables/optional";

export const loadChat = async (context: Context): Promise<Chat> => {
  // Get variables from GitHub
  const apiKey = await getAPIKeyFromGH(context);
  const optionalVariables = await getOptionalVariablesFromGH(
    ["OPENAI_MODEL_NAME", "TEMPERATURE", "SUPABASE_URL", "SUPABASE_KEY"],
    context
  );

  const ai = new AIModel({
    modelName: optionalVariables.OPENAI_MODEL_NAME ?? "gpt-4-1106-preview",
    apiKey,
    temperature: optionalVariables.temperature
      ? parseFloat(optionalVariables.temperature)
      : 0,
  });

  if (optionalVariables.SUPABASE_URL && optionalVariables.SUPABASE_KEY) {
    const db = new VectorDatabase(
      optionalVariables.SUPABASE_URL,
      optionalVariables.SUPABASE_KEY,
      ai.embeddings
    );

    return new Chat(ai, db);
  }

  return new Chat(ai);
};
