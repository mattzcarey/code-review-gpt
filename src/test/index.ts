import path from 'path';

import { commentOnPR as commentOnPRGitHub } from '../common/ci/github/commentOnPR';
import { commentOnPR as commentOnPRGitLab } from '../common/ci/gitlab/commentOnPR';
import { createModel } from '../common/llm/models';
import { getMaxPromptLength } from '../common/llm/promptLength';
import { PlatformOptions, type TestArgs } from '../common/types';
import { signOff } from './constants';
import { loadOrGenerateCodeSnippets } from './load/codeSnippets';
import { loadSnapshots } from './load/snapshots';
import { loadTestCases } from './load/testCases';
import { runTests } from './run/runTest';

export const test = async ({ ci, modelString, reviewType }: TestArgs): Promise<void> => {
  const maxPromptLength = getMaxPromptLength(modelString);

  // Create the model.
  const model = createModel(modelString);

  // Fetch the test cases.
  const testCases = await loadTestCases(path.join(__dirname, 'cases'));

  // Load the code snippets for the test cases. Generate them if they don't exist or are outdated.
  const testCasesWithSnippets = await loadOrGenerateCodeSnippets(
    testCases,
    path.join(__dirname, 'cases/.cache'),
    model
  );

  // Load the snapshots in a vector store.
  const vectorStore = await loadSnapshots(path.join(__dirname, 'cases/snapshots'));

  // Run the review on the code snippets and compare the results to the expected results.
  const testSummary = await runTests(
    testCasesWithSnippets,
    model,
    maxPromptLength,
    vectorStore,
    reviewType
  );

  if (ci === PlatformOptions.GITHUB) {
    await commentOnPRGitHub(testSummary, signOff);
  }

  if (ci === PlatformOptions.GITLAB) {
    await commentOnPRGitLab(testSummary, signOff);
  }
};
