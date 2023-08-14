import {
  LANGCHAIN_API_KEY_PARAM_NAME,
  OPENAI_API_KEY_PARAM_NAME,
} from "../../constants";

export const reviewLambdaEnvironment: Record<string, string> = {
  OPENAI_API_KEY_PARAM_NAME: OPENAI_API_KEY_PARAM_NAME,
  LANGCHAIN_API_KEY_PARAM_NAME: LANGCHAIN_API_KEY_PARAM_NAME,
  LANGCHAIN_TRACING_V2: "true",
  LANGCHAIN_PROJECT: "demo-review",
  LANGCHAIN_ENDPOINT: "https://api.smith.langchain.com",
};
