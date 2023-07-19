import { askAI } from "../../review/llm/askAI";
import { constructPromptsArray } from "../../review/prompt/constructPrompt";
import { TestCase } from "../types";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { generateTestReport } from "./generateTestReport";

const runTest = async (
  testCase: TestCase,
  modelName: string,
  vectorStore: MemoryVectorStore
) => {
  if (!testCase.snippet) {
    throw new Error(`Test case ${testCase.name} does not have a snippet.`);
  }
  // First step: run the review on the code snippet.
  const prompts = await constructPromptsArray([testCase.snippet]);
  const reviewResponse = await askAI(prompts, modelName);

  const similarityResponse = await vectorStore.similaritySearchWithScore(
    reviewResponse,
    1
  );

  if (similarityResponse.length === 0) {
    throw new Error(`No similar reviews found for test case ${testCase.name}.`);
  }

  const [similarDocument, similarity] = similarityResponse[0];

  console.log(
    generateTestReport(
      testCase,
      reviewResponse,
      similarDocument.pageContent,
      similarity
    )
  );
};

export const runTests = async (
  testCases: TestCase[],
  modelName: string,
  vectorStore: MemoryVectorStore
): Promise<void> => {
  if (testCases.length === 0) {
    console.info("No test cases found.");
    return;
  }

  for (const testCase of testCases) {
    try {
      await runTest(testCase, modelName, vectorStore);
    } catch (error) {
      console.error(`Error running test case ${testCase.name}:`, error);
    }
  }
};
