export const signOff =
  "#### Powered by [Code Review GPT](https://github.com/mattzcarey/code-review-gpt)";

export const modelInfo = [
  {
    model: "gpt-4-1106-preview",
    maxPromptLength: 300000, //100k tokens
  },
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

export const reviewPrompt = `You are a senior developer, your task is to review a pull requests. Below is a code patch.

Highlight potential bugs, improve readability, make code cleaner, and maximise the performance of the programming language. Flag any API keys or secrets present in the code in plain text immediately as highest risk. Rate the changes based on SOLID principles if applicable.

Do not comment on breaking functions down into smaller, more manageable functions unless it is a huge problem. Also be aware that there will be libraries and techniques used which you are not familiar with, so do not comment on those unless you are confident that there is a problem.

Ensure the feedback details are brief, concise, accurate. If there are multiple similar issues, only comment on the most critical.

Include brief code snippets in your feedback when you're confident your suggestions are improvements. Use the same programming language as the file under review.

Code patch to review:`;

export const languageMap: { [key: string]: string } = {
  ".js": "JavaScript",
  ".ts": "TypeScript",
  ".py": "Python",
  ".sh": "Shell",
  ".go": "Go",
  ".rs": "Rust",
  ".tsx": "TypeScript",
  ".jsx": "JavaScript",
  ".dart": "Dart",
  ".php": "PHP",
  ".cpp": "C++",
  ".h": "C++",
  ".cxx": "C++",
  ".hpp": "C++",
  ".hxx": "C++",
  ".rb": "Ruby",
  ".kt": "Kotlin",
  ".kts": "Kotlin",
  ".java": "Java",
};

export const supportedFiles = new Set(Object.keys(languageMap));

export const excludedKeywords = new Set(["types"]);

export const maxFeedbackCount = 3;
