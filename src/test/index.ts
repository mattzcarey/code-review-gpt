import path from "path";
import { loadTestCases } from "./load/loadTestCases";
import AIModel from "../common/model/AIModel";
import { openAIApiKey } from "../config";
import { loadOrGenerateCodeSnippets } from "./load/loadTestCodeSnippets";
import { runTests } from "./run/runTest";
import { loadSnapshots } from "./load/loadSnapshots";
import { ReviewArgs } from "../args";
import { getMaxPromptLength } from "../common/model/getMaxPromptLength";
import { commentOnPR } from "../common/ci/commentOnPR";
import { signOff } from "./constants";

export const test = async ({ ci, model }: ReviewArgs) => {
  const maxPromptLength = getMaxPromptLength(model);

  // Fetch the test cases.
  const testCases = loadTestCases(path.join(__dirname, "cases"));

  // Load the code snippets for the test cases. Generate them if they don't exist or are outdated.
  const testCasesWithSnippets = await loadOrGenerateCodeSnippets(
    testCases,
    path.join(__dirname, "cases/.cache"),
    new AIModel({
      modelName: model,
      temperature: 0.0,
      apiKey: openAIApiKey(),
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
    vectorStore
  );

  if (ci) {
    await commentOnPR(testSummary, signOff);
  }
};
