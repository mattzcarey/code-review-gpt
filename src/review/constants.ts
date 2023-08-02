export const signOff =
  "#### Powered by [Code Review GPT](https://github.com/mattzcarey/code-review-gpt)";

export const modelInfo = [
  {
    model: "gpt-4",
    maxPromptLength: 21000, //8k tokens
  },
  {
    model: "gpt-4-32k",
    maxPromptLength: 90000, //32k tokens
  },
  {
    model: "gpt-3.5-turbo",
    maxPromptLength: 9000, //4k tokens
  },
  {
    model: "gpt-3.5-turbo-16k",
    maxPromptLength: 45000, //16k tokens
  },
]; // Response needs about 1k tokens ~= 3k characters

export const supportedFiles = new Set([
  ".js",
  ".ts",
  ".py",
  ".sh",
  ".go",
  ".rs",
  ".tsx",
  ".jsx",
  ".dart",
]);

export const excludedKeywords = new Set(["types"]);

export const maxFeedbackCount = 3;
