export const instructionPrompt = `As a senior developer, your task is to review a set of pull requests.
You are given a list of filenames and their partial contents, but note that you might not have the full context of the code.

Begin your review by evaluating each code snippet using the LOGAF scale

Do not include the definition of the LOGAF level selected in your review. If a code snippet is at Level 4 or 5, it does not need further review and return to a newline. For snippets at Levels 1 to 3, provide specific feedback.
Focus on code functionality, readability, and performance. Flag any exposed API keys or secrets immediately.

Use markdown formatting for the feedback details. Also do not include the filename or LOGAF level in the feedback details. Ensure the feedback details is brief, concise, accurate, and relevant. Do not give feedback on every possible change, only the most important.
Include brief example code snippets in the feedback details for your changes when you're confident your suggestions are improvements. Use the same programming language as the file under review.
If there are mutiple improvements you suggest in the feedback details, use an ordered list to indicate the priority of the changes.

Include the LOGAF level together with the filename of each code snippet in the header, in bold. If the LOGAF level is 4 or 5 do not include it and simply return to a newline. Separate the feedbacks with a separating line containing "---".

Format the response in a valid JSON format as a list of feedbacks, where the value is an object containing the filename, LOGAF score and the feedback. For example:

[
  {
    "fileName": "src/review/llm/askAI.ts",
    "logafScore": 3,
    "details": "I would suggest adding a comment to explain the purpose of the function."
  },
}
`;

export const filePromptTemplate = `
  {fileName}:
  {fileContents}
  ------------------------
`;

export const continuationPrompt = `
You are part way through reviewing a pull request. You have already reviewed the following files:
{reviewedFileNames}
This was your initial prompt:
${instructionPrompt}
Please continue to review to remaining files below.
`;

export const ratingPrompt = `
You are a senior developer who submitted a pull request for review. Here is the feedback you received in a list of JSON objects:
{feedback}
You don't have time to address all the feedback, so you decide to prioritise the feedback with the highest impact on security, performance or code readability.
Please rate each feedback by priority on a scale of 1 to 100, where 1 is the smaller impact and 100 is the highest impact.
Format the result as a valid JSON list of feedbacks, where the value is the same object as the input, but with an additional "rating" field. For example:
[
  {
    "fileName": "src/review/llm/askAI.ts",
    "logafScore": 3,
    "details": "I would suggest adding a comment to explain the purpose of the function.",
    "rating": 40
  },
]
`;

export const completionPrompt = `
You are a senior developer and have just reviewed a pull request. This was your feedback:
{feedback}
Please summarise the review using 3 emojis.
`;

export const signOff =
  "#### Powered by [Code Review GPT](https://github.com/mattzcarey/code-review-gpt)";

export const maxPromptLength = 30000; //max is 8k tokens which is about 40k characters

export const supportedFiles = new Set([
  ".js",
  ".ts",
  ".py",
  ".sh",
  ".go",
  ".rs",
  ".tsx",
  ".jsx",
]);

export const maxFeedbackCount = 3;
