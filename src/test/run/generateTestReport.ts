import { TestCase } from "../types";

export const generateTestReport = (
  testCase: TestCase,
  review: string,
  similarReview: string,
  similarity: number
): string => `

**Test case: ${testCase.name}**

 > Test case description: ${testCase.description}

 > Test case snippet: ${testCase.snippet}

===============================================================================

 > Review:
${review}
===============================================================================

> Similar review:
${similarReview}
===============================================================================

 > Similarity score: ${similarity}

`;
