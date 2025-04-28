import path from 'path';
import { mkdir, readFile, readdir } from 'fs/promises';

import { Faithfulness } from 'autoevals'; // Import Factuality scorer
import { createModel } from '../common/llm'; // Restore imports
import { getPlatformProvider } from '../common/platform/factory';
import type { ReviewFile } from '../common/types'; // Type for pipeline input shaping
import { logger } from '../common/utils/logger';
import { runAgenticReview } from '../review/agent';
import { constructPrompt } from '../review/prompt';
import { describeEval } from './framework';
import type { TaskFn, TestCase } from './framework/types';
import { isTestCaseMetadata } from './framework/utils/metadata';
import { loadOrGenerateCodeSnippet } from './framework/utils/snippets';

// --- Configuration ---
const modelString = process.env.MODEL_NAME || 'openai:gpt-4o-mini'; // Default to a reasonable model

const testCaseDir = path.resolve(__dirname, './cases'); // Original test cases
const snapshotDir = path.resolve(testCaseDir, '.snapshots');
const snippetCacheDir = path.resolve(testCaseDir, '.cache'); // New cache location for specs

const dirMap = {
  testCaseDir,
  snapshotDir,
  snippetCacheDir,
};

// Ensure cache directory exists
await mkdir(snippetCacheDir, { recursive: true });

/**
 * Loads all test case data (input snippet + expected snapshot).
 */
const loadTestCaseData = async (): Promise<TestCase<string, string>[]> => {
  const model = createModel(modelString); // Model for snippet generation
  const testCaseFiles = (await readdir(testCaseDir)).filter((file) => file.endsWith('.json'));

  const testCases = await Promise.all(
    testCaseFiles.map(async (file): Promise<TestCase<string, string> | null> => {
      const jsonPath = path.join(testCaseDir, file);
      const baseName = path.basename(file, '.json');
      const snapshotPath = path.join(snapshotDir, `${baseName}.md`);

      try {
        // Load metadata from JSON
        const metaContent = await readFile(jsonPath, 'utf8');
        const parsedMeta: unknown = JSON.parse(metaContent);
        if (!isTestCaseMetadata(parsedMeta)) {
          logger.warn(`Skipping invalid test case metadata file: ${file}`);
          return null;
        }

        // Load/Generate input snippet
        const inputSnippet = await loadOrGenerateCodeSnippet(parsedMeta, model, dirMap);

        // Load expected snapshot
        const expectedSnapshot = await readFile(snapshotPath, 'utf8');

        return {
          input: inputSnippet,
          expected: expectedSnapshot,
          // We might want to add metadata like parsedMeta.name here later if needed by scorer/task
        };
      } catch (error) {
        logger.error(`Error loading test case ${baseName}:`, error);
        return null; // Skip this test case on error
      }
    })
  );

  // Filter out nulls (cases that failed to load)
  const validTestCases = testCases.filter((tc): tc is TestCase<string, string> => tc !== null);
  logger.info(`Loaded ${validTestCases.length} valid test cases.`);
  return validTestCases;
};

// --- Task Function (Implementation) ---
// This function takes the input snippet and returns the model's review
const reviewTask: TaskFn<string, string> = async (inputSnippet: string): Promise<string> => {
  const model = createModel(modelString);
  const reviewLanguage = 'English';

  // Create a mock ReviewFile
  const fileName = 'test.ts';
  const reviewFile: ReviewFile = {
    fileName,
    fileContent: inputSnippet,
    changedLines: [],
  };

  // Use the centralized prompt construction logic
  const prompt = await constructPrompt(
    [reviewFile], // Pass as an array
    reviewLanguage
  );

  const platformProvider = await getPlatformProvider('local');

  try {
    // Call the actual review pipeline with the generated prompts
    const { success, message } = await runAgenticReview(prompt, model, platformProvider, 25);

    if (!success) {
      throw new Error('Review pipeline failed');
    }

    // TODO: combine it into an actual report
    return message;
  } catch (error) {
    logger.error('Error during reviewPipeline execution in reviewTask:', error);
    throw new Error(
      `Review pipeline failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

// --- Test Suite Definition ---
describeEval('Code Review Tests', {
  data: loadTestCaseData,
  task: reviewTask,
  scorers: [Faithfulness],
  threshold: 0.7,
  timeout: 60000,
  modelString,
});
