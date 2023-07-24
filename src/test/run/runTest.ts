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

/**
 * Run a single test case.
 * @param testCase The test case.
 * @param modelName The name of the model.
 * @param maxPromptLength The maximum prompt length.
 * @param vectorStore The vector store.
 * @returns The test result.
 */
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

/**
 * Run all the test cases.
 * @param testCases The test cases.
 * @param modelName The name of the model.
 * @param maxPromptLength The maximum prompt length.
 * @param vectorStore The vector store.
 * @returns The test results.
 */
export const runTests = async (
  testCases: TestCase[],
  modelName: string,
  maxPromptLength: number,
  vectorStore: MemoryVectorStore
): Promise<string> => {
  if (testCases.length === 0) {
    return "No test cases found.";
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
  const testSummary = generateTestResultsSummary(testResults);

  console.info(testSummary);

  return testSummary;
};
