import path from "path";
import { generateHash } from "./hash";
import { readFileSync, writeFileSync } from "fs";
import AIModel from "../../model/AIModel";
import { generateCodeSnippetsPrompt } from "../constants";
import { TestCase } from "../types";

/**
 * Generate a code snippet for a test case.
 * @param testCase The test case to generate the code snippet for.
 * @param model The model to use to generate the code snippet.
 * @returns The code snippet.
 */
const generateCodeSnippet = async (
  testCase: TestCase,
  model: AIModel
): Promise<string> => {
  const prompt = generateCodeSnippetsPrompt.replace(
    "{testCase}",
    JSON.stringify(testCase)
  );

  const modelResponse = (await model.callModel(prompt)) as string;
  return modelResponse.replace("```typescript", "").replace("```", "");
};

/**
 * Load a code snippet for a test case from the cache, or generate it if it is not found.
 * @param testCase The test case to load the code snippet for.
 * @param snippetCacheDir The directory containing the code snippet cache.
 * @param model The model to use to generate the code snippet.
 * @returns The test case with the code snippet.
 */
const loadOrGenerateCodeSnippet = async (
  testCase: TestCase,
  snippetCacheDir: string,
  model: AIModel
): Promise<TestCase> => {
  if (testCase.snippet) {
    return testCase;
  }

  // Try to load the snippet from the cache, using the hashed description as the key
  const hashedDescription = generateHash(testCase.description);

  try {
    readFileSync(path.join(snippetCacheDir, `${hashedDescription}.ts`), "utf8");
    return {
      ...testCase,
      snippet: path.join(snippetCacheDir, `${hashedDescription}.ts`),
    };
  } catch (error) {
    console.info(
      `Snippet not found in cache: ${testCase.name}. Generating it...`
    );
    // If the snippet is not found, generate it
    const snippet = await generateCodeSnippet(testCase, model);

    // Save the snippet to the cache
    writeFileSync(
      path.join(snippetCacheDir, `${hashedDescription}.ts`),
      snippet,
      "utf8"
    );

    return {
      ...testCase,
      snippet: path.join(snippetCacheDir, `${hashedDescription}.ts`),
    };
  }
};

/**
 * Load all code snippets for a set of test cases from the cache, or generate them if they are not found.
 * @param testCases The test cases to load the code snippets for.
 * @param snippetCacheDir The directory containing the code snippet cache.
 * @param model The model to use to generate the code snippets.
 * @returns The test cases with the code snippets.
 */
export const loadOrGenerateCodeSnippets = async (
  testCases: TestCase[],
  snippetCacheDir: string,
  model: AIModel
): Promise<TestCase[]> => {
  return Promise.all(
    testCases.map((testCase) =>
      loadOrGenerateCodeSnippet(testCase, snippetCacheDir, model)
    )
  );
};
