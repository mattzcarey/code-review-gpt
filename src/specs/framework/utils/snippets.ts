import crypto from 'crypto';
import path from 'path';
import type { LanguageModelV1 } from 'ai';
import { generateText } from 'ai';
import { readFile, writeFile } from 'fs/promises';
import { logger } from '../../../common/utils/logger';
import type { TestCaseMetadata } from './metadata';

export const generateCodeSnippetsPrompt = `
Your role is to help testing a GPT application reviewing code changes. You receive a test case and you need to generate code in typescript corresponding to this test case, even if it follows bad practices or has security issues.
The test cases is formatted as a stringified JSON object with the following properties:
- name: the name of the test case
- description: the description of the test case

The input is the following:
{testCase}

Return the content of a valid typescript file that would pass the test case.
`;

// --- Helper Functions (Adapted from old test system) ---

const hashAlgorithm = 'sha256';
const generateHash = (data: string): string => {
  return crypto.createHash(hashAlgorithm).update(data).digest('hex');
};

/**
 * Load a code snippet for a test case from the cache, or generate it if it is not found.
 */
export const loadOrGenerateCodeSnippet = async (
  testCaseMeta: TestCaseMetadata,
  model: LanguageModelV1,
  dirMap: {
    testCaseDir: string;
    snapshotDir: string;
    snippetCacheDir: string;
  }
): Promise<string> => {
  const hashedDescription = generateHash(testCaseMeta.description);
  const cacheFileName = path.join(dirMap.snippetCacheDir, `${hashedDescription}.ts`);

  try {
    // Try reading from cache first
    const fileContent = await readFile(cacheFileName, 'utf8');
    logger.debug(`Snippet found in cache for: ${testCaseMeta.name}`);
    return fileContent;
  } catch (error: unknown) {
    // Check if it's a file not found error
    const isENOENT =
      typeof error === 'object' && error !== null && (error as { code?: string }).code === 'ENOENT';

    if (!isENOENT) {
      // Log unexpected errors
      logger.error(`Error reading snippet cache file ${cacheFileName}:`, error);
      throw error; // Rethrow if it's not a "file not found" error
    }

    // If ENOENT (file not found), generate the snippet
    logger.info(`Snippet not found in cache for: ${testCaseMeta.name}. Generating...`);
    try {
      const prompt = generateCodeSnippetsPrompt.replace('{testCase}', JSON.stringify(testCaseMeta));
      // Remove markdown code fences if present in the model response
      const { text } = await generateText({
        model,
        prompt,
      });
      const snippet = text
        .replace(/^\s*```typescript\s*\n?/gm, '')
        .replace(/\n?```\s*$/gm, '')
        .trim();

      // Save the generated snippet to the cache
      await writeFile(cacheFileName, snippet, 'utf8');
      logger.debug(`Snippet generated and cached for: ${testCaseMeta.name}`);
      return snippet;
    } catch (generationError) {
      logger.error(
        `Failed to generate or cache snippet for ${testCaseMeta.name}:`,
        generationError
      );
      throw generationError; // Rethrow generation error
    }
  }
};
