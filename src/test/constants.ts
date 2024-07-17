// The prompt used to generate code snippets.
export const generateCodeSnippetsPrompt = `
Your role is to help testing a GPT application reviewing code changes. 
You receive a test case and you need to generate code in typescript to pass the tes, even if it follows bad practices or has security issues.

<test case name>:
{testCaseName}
</test case name>

<test case description>
{testCaseDescription}
</test case description>

Return only a valid typescript file nothing else.
`

// The threshold for the similarity score to pass the test.
export const testThreshold = 0.1

export const signOff =
  "#### Tests Powered by [Code Review GPT](https://github.com/mattzcarey/code-review-gpt)"
