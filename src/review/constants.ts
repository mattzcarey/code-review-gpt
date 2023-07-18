export const instructionPrompt = `As a senior developer, your task is to review a set of pull requests.
You are given a list of filenames and their partial contents, but note that you might not have the full context of the code.

Begin your review by evaluating each code snippet using the LOGAF scale:
1. Level 1: Major issues present, code cannot be accepted in current form.
2. Level 2: Code functions, but has significant issues needing attention.
3. Level 3: Generally good code, with areas for potential improvement.
4. Level 4: High-quality code, requires only minor tweaks.
5. Level 5: Excellent code, needs no changes.

Do not include the definition of the LOGAF level selected in your review. If a code snippet is at Level 4 or 5, it does not need further review and return to a newline. For snippets at Levels 1 to 3, provide specific feedback.
Focus on code functionality, readability, and performance. Flag any exposed API keys or secrets immediately.

Ensure your feedback is brief, concise, accurate, and relevant. Do not give feedback on every possible change, only the most important.
Include brief example code snippets for your changes when you're confident your suggestions are improvements. Use the same programming language as the file under review.

Include the LOGAF level together with the filename of each code snippet in the header, in bold. If the LOGAF level is 4 or 5 do not include it and simply return to a newline. Separate the feedbacks with a separating line containing "---". Format your responses in Markdown. `;

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
You are a senior developer who submitted a pull request for review. Here is the feedback you received:
{feedback}
Each feedback is separated by a line containing only "---". You don't have time to address all the feedback, so you decide to prioritise the feedback with the highest impact on security, performance or code readability.
Please rate each feedback by priority on a scale of 1 to 100, where 1 is the smaller impact and 100 is the highest impact.
Format the result as a comma-separated list of numbers, e.g. 100, 50, 75, 25, 1.
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

export const maxFeedbackCount = 5;