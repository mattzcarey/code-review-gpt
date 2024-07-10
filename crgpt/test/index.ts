import path from "path";

import { commentOnPR as commentOnPRGitHub } from "../common/ci/github/commentOnPR";
import { commentOnPR as commentOnPRGitLab } from "../common/ci/gitlab/commentOnPR";
import AIModel from "../common/model/AIModel";
import { getMaxPromptLength } from "../common/model/getMaxPromptLength";
import { PlatformOptions, ReviewArgs } from "../common/types";
import { signOff } from "./constants";
import { loadSnapshots } from "./load/loadSnapshots";
import { loadTestCases } from "./load/loadTestCases";
import { loadOrGenerateCodeSnippets } from "./load/loadTestCodeSnippets";
import { runTests } from "./run/runTest";

export const test = async (
  { ci, model, reviewType }: ReviewArgs,
  openAIApiKey: string
): Promise<void> => {
  const maxPromptLength = getMaxPromptLength(model);

  // Fetch the test cases.
  const testCases = await loadTestCases(path.join(__dirname, "cases"));

  // Load the code snippets for the test cases. Generate them if they don't exist or are outdated.
  const testCasesWithSnippets = await loadOrGenerateCodeSnippets(
    testCases,
    path.join(__dirname, "cases/.cache"),
    new AIModel({
      modelName: model,
      temperature: 0.0,
      apiKey: openAIApiKey,
      organization: undefined,
      provider: "openai",
    })
  );

  // Load the snapshots in a vector store.
  const vectorStore = await loadSnapshots(
    path.join(__dirname, "cases/snapshots")
  );

  // Run the review on the code snippets and compare the results to the expected results.
  const testSummary = await runTests(
    testCasesWithSnippets,
    model,
    maxPromptLength,
    vectorStore,
    reviewType,
    openAIApiKey
  );

  if (ci === PlatformOptions.GITHUB) {
    await commentOnPRGitHub(testSummary, signOff);
  }

  if (ci === PlatformOptions.GITLAB) {
    await commentOnPRGitLab(testSummary, signOff);
  }
};
