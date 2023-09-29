import chalk from "chalk";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

import { logger } from "../../common/utils/logger";
import { askAI } from "../../review/llm/askAI";
import { constructPromptsArray } from "../../review/prompt/constructPrompt/constructPrompt";
import { TestCase } from "../types";
import {
  generateTestReport,
  generateTestResultsSummary,
  testResult,
} from "./generateTestReport";

/**
 * Run a single test case.
 * @param testCase The test case.
 * @param modelName The name of the model.
 * @param maxPromptLength The maximum prompt length.
 * @param vectorStore The vector store.
 * @param reviewType The review type.
 * @returns The test result.
 */
const runTest = async (
  testCase: TestCase,
  modelName: string,
  maxPromptLength: number,
  vectorStore: MemoryVectorStore,
  reviewType: string,
  openAIApiKey: string
): Promise<testResult> => {
  if (!testCase.snippet) {
    throw new Error(`Test case ${testCase.name} does not have a snippet.`);
  }

  logger.info(chalk.blue(`Running test case ${testCase.name}...`));

  // First step: run the review on the code snippet.
  const prompts = constructPromptsArray(
    [testCase.snippet],
    maxPromptLength,
    reviewType
  );

  const { markdownReport: reviewResponse } = await askAI(
    prompts,
    modelName,
    openAIApiKey,
    undefined,
    "openai"
  );

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

  logger.info(report);

  return result;
};

/**
 * Run all the test cases.
 * @param testCases The test cases.
 * @param modelName The name of the model.
 * @param maxPromptLength The maximum prompt length.
 * @param vectorStore The vector store.
 * @param reviewType The review type.
 * @returns The test results.
 */
export const runTests = async (
  testCases: TestCase[],
  modelName: string,
  maxPromptLength: number,
  vectorStore: MemoryVectorStore,
  reviewType: string,
  openAIApiKey: string
): Promise<string> => {
  if (testCases.length === 0) {
    return "No test cases found.";
  }

  logger.info(`Running ${testCases.length} test cases...\n`);

  // Keep track of all test results.
  const testResults: { [key: string]: testResult } = {};

  for (const testCase of testCases) {
    try {
      const result = await runTest(
        testCase,
        modelName,
        maxPromptLength,
        vectorStore,
        reviewType,
        openAIApiKey
      );
      testResults[testCase.name] = result;
    } catch (error) {
      logger.error(`Error running test case ${testCase.name}:`, error);
    }
  }
  const testSummary = generateTestResultsSummary(testResults);

  logger.info(testSummary);

  return testSummary;
};
