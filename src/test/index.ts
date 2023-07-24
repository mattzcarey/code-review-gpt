import path from "path";
import { loadTestCases } from "./load/loadTestCases";
import AIModel from "../model/AIModel";
import { openAIApiKey } from "../config";
import { loadOrGenerateCodeSnippets } from "./load/loadTestCodeSnippets";
import { runTests } from "./run/runTest";
import { loadSnapshots } from "./load/loadSnapshots";
import { ReviewArgs } from "../args";
import { getMaxPromptLength } from "../model/getMaxPromptLength";

export const test = async (yargs: ReviewArgs) => {
  // Run the review on code examples
  // Compare the results to the expected results

  const modelName = yargs.model;

  const maxPromptLenght = getMaxPromptLength(modelName);

  // Fetch the test cases.
  const testCases = loadTestCases(path.join(__dirname, "cases"));

  // Load the code snippets for the test cases. Generate them if they don't exist or are outdated.
  const testCasesWithSnippets = await loadOrGenerateCodeSnippets(
    testCases,
    path.join(__dirname, "cases/.cache"),
    new AIModel({
      modelName: modelName,
      temperature: 0.0,
      apiKey: openAIApiKey(),
    })
  );

  // Load the snapshots in a vector store.
  const vectorStore = await loadSnapshots(
    path.join(__dirname, "cases/snapshots")
  );

  // Run the review on the code snippets and compare the results to the expected results.
  await runTests(
    testCasesWithSnippets,
    modelName,
    maxPromptLenght,
    vectorStore
  );
};
