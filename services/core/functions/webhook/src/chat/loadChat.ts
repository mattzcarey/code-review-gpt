import { Context } from "probot";

import { Chat } from "./chat";
import { getAPIKeyFromGH } from "./variables/apiKey";
import { getOptionalVariablesFromGH } from "./variables/optional";

export const loadChat = async (
  context: Context<"pull_request">
): Promise<Chat> => {
  if (process.env.OPENAI_API_KEY) {
    return new Chat(process.env.OPENAI_API_KEY, process.env.OPENAI_MODEL_NAME);
  }

  const apiKey = await getAPIKeyFromGH(context);
  const optionalVariables = await getOptionalVariablesFromGH(
    ["OPENAI_MODEL_NAME", "TEMPERATURE"],
    context
  );

  return new Chat(
    apiKey,
    optionalVariables.OPENAI_MODEL_NAME,
    optionalVariables.TEMPERATURE
  );
};
