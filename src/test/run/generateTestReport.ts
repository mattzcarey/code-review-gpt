import { testThreshold } from "../constants";
import { TestCase } from "../types";
import chalk from "chalk";

export enum testResult {
  PASS = "PASS",
  WARN = "WARN",
  FAIL = "FAIL",
}

export const generateTestReport = (
  testCase: TestCase,
  review: string,
  similarReview: string,
  similarity: number
): { report: string; result: testResult } => {
  // If the similarity score is more than 1 - threshold, then the test is considered as passing.
  // Else if the similarity score is more than 1 - 3 * threshold, then the test is considered as warn. We display a complete report for this test but do not fail the test.
  // Else, the test is considered as failing. We display a complete report for this test and fail the test.
  if (similarity > 1 - testThreshold) {
    return {
      result: testResult.PASS,
      report: chalk.green(
        `[PASS] - Test case: ${testCase.name} - Similarity score: ${similarity}\n`
      ),
    };
  } else if (similarity > 1 - 3 * testThreshold) {
    return {
      result: testResult.WARN,
      report:
        chalk.yellow(
          `[WARN] - Test case: ${testCase.name} - Similarity score: ${similarity}\n`
        ) + testReportTemplate(testCase, review, similarReview, similarity),
    };
  } else {
    return {
      result: testResult.FAIL,
      report:
        chalk.red(
          `[FAIL] - Test case: ${testCase.name} - Similarity score: ${similarity}\n`
        ) + testReportTemplate(testCase, review, similarReview, similarity),
    };
  }
};

const testReportTemplate = (
  testCase: TestCase,
  review: string,
  similarReview: string,
  similarity: number
) => `
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

const summaryLineForTestResult = (testName: string, result: testResult) => {
  switch (result) {
    case testResult.PASS:
      return chalk.green(`[PASS] - Test case: ${testName}`);
    case testResult.WARN:
      return chalk.yellow(`[WARN] - Test case: ${testName}`);
    case testResult.FAIL:
      return chalk.red(`[FAIL] - Test case: ${testName}`);
  }
};

export const generateTestResultsSummary = (testResults: {
  [key: string]: testResult;
}): string => {
  const { detailledSummary, counts } = Object.entries(testResults).reduce(
    (summary, [testCaseName, result]) => {
      return {
        detailledSummary:
          summary.detailledSummary +
          summaryLineForTestResult(testCaseName, result) +
          "\n",
        counts: { ...summary.counts, [result]: summary.counts[result] + 1 },
      };
    },
    {
      detailledSummary: chalk.blue(`\nTest results summary:\n`),
      counts: { PASS: 0, WARN: 0, FAIL: 0 },
    }
  );

  return (
    detailledSummary +
    `\n SUMMARY: ${chalk.green(`PASS: ${counts.PASS}`)}, ${chalk.yellow(
      `WARN: ${counts.WARN}`
    )}, ${chalk.red(`FAIL: ${counts.FAIL}`)}\n`
  );
};
