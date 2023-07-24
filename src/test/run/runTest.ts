import { askAI } from "../../review/llm/askAI";
import { constructPromptsArray } from "../../review/prompt/constructPrompt";
import { TestCase } from "../types";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import {
  generateTestReport,
  generateTestResultsSummary,
  testResult,
} from "./generateTestReport";
import chalk from "chalk";

const runTest = async (
  testCase: TestCase,
  modelName: string,
  maxPromptLength: number,
  vectorStore: MemoryVectorStore
): Promise<testResult> => {
  if (!testCase.snippet) {
    throw new Error(`Test case ${testCase.name} does not have a snippet.`);
  }

  console.info(chalk.blue(`Running test case ${testCase.name}...`));

  // First step: run the review on the code snippet.
  const prompts = await constructPromptsArray(
    [testCase.snippet],
    maxPromptLength
  );
  const reviewResponse = await askAI(prompts, modelName, false);

  const similarityResponse = await vectorStore.similaritySearchWithScore(
    reviewResponse,
    1
  );

  if (similarityResponse.length === 0) {
    throw new Error(`No similar reviews found for test case ${testCase.name}.`);
  }

  const [similarDocument, similarity] = similarityResponse[0];

  const { result, report } = generateTestReport(
    testCase,
    reviewResponse,
    similarDocument.pageContent,
    similarity
  );

  console.log(report);

  return result;
};

export const runTests = async (
  testCases: TestCase[],
  modelName: string,
  maxPromptLength: number,
  vectorStore: MemoryVectorStore
): Promise<void> => {
  if (testCases.length === 0) {
    console.info("No test cases found.");
    return;
  }

  console.info(`Running ${testCases.length} test cases...\n`);

  // Keep track of all test results.
  const testResults: { [key: string]: testResult } = {};

  for (const testCase of testCases) {
    try {
      const result = await runTest(
        testCase,
        modelName,
        maxPromptLength,
        vectorStore
      );
      testResults[testCase.name] = result;
    } catch (error) {
      console.error(`Error running test case ${testCase.name}:`, error);
    }
  }

  // Display the test results.
  const testResultsSummary = generateTestResultsSummary(testResults);

  console.log(testResultsSummary);
};
