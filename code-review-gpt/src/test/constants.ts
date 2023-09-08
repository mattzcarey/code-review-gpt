// The prompt used to generate code snippets.
export const generateCodeSnippetsPrompt = `
Your role is to help testing a GPT application reviewing code changes. You receive a test case and you need to generate code in typescript corresponding to this test case, even if it follows bad practices or has security issues.
The test cases is formatted as a stringified JSON object with the following properties:
- name: the name of the test case
- description: the description of the test case

The input is the following:
{testCase}

Return the content of a valid typescript file that would pass the test case.
`;

// The threshold for the similarity score to pass the test.
export const testThreshold = 0.1;

export const signOff =
  "#### Tests Powered by [Code Review GPT](https://github.com/mattzcarey/code-review-gpt)";
