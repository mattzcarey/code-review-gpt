import path from "path";
import { generateHash } from "./hash";
import { readFileSync, writeFileSync } from "fs";
import AIModel from "../../model/AIModel";
import { generateCodeSnippetsPrompt } from "../constants";
import { TestCase } from "../types";

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
