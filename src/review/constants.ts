export const instructionPrompt = `As a senior developer, your task is to review a set of pull requests.
You are given a list of filenames and their partial contents, but note that you might not have the full context of the code.

Begin your review by evaluating each code snippet using the LOGAF scale

Do not include the definition of the LOGAF level selected in your review. If a code snippet is at Level 4 or 5, it does not need further review and return to a newline. For snippets at Levels 1 to 3, provide specific feedback.
Focus on code functionality, readability, and performance. Flag any exposed API keys or secrets immediately.

Use markdown formatting for the feedback details. Also do not include the filename or LOGAF level in the feedback details. Ensure the feedback details is brief, concise, accurate, and relevant. Do not give feedback on every possible change, only the most important.
Include brief example code snippets in the feedback details for your changes when you're confident your suggestions are improvements. Use the same programming language as the file under review.
If there are multiple improvements you suggest in the feedback details, use an ordered list to indicate the priority of the changes.

Include the LOGAF level together with the filename of each code snippet in the header, in bold. If the LOGAF level is 4 or 5 do not include it and simply return to a newline.

Format the response in a valid JSON format as a list of feedbacks, where the value is an object containing the filename ("fileName"), LOGAF score ("logafScore"), the feedback ("details") and the line number ("line") of the code you are providing feedback on. The schema of the JSON feedback object must be:
{
  "fileName": {
    "type": "string"
  },
  "logafScore": {
    "type": "number"
  },
  "details": {
    "type": "string"
  },
  "line": {
    "type": "number"
  }
}

The filenames and file contents to review are provided below as a list of JSON objects containing the filename and the file content:

`;

export const completionPrompt = `
You are a senior developer and have just reviewed a pull request. This was your feedback:
{feedback}
Please summarise the review using 3 emojis.
`;

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

export const maxFeedbackCount = 3;
