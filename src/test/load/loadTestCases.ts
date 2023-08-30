import { readdir, readFile } from "fs/promises";
import path from "path";

import { logger } from "../../common/utils/logger";
import { TestCase } from "../types";

/**
 * Load a single test case defined in a JSON file.
 * @param testCasePath The path to the JSON test case file.
 * @returns The test case.
 */
const loadTestCase = async (testCasePath: string): Promise<TestCase> => {
  try {
    const fileData = await readFile(testCasePath, "utf8");

    return JSON.parse(fileData) as TestCase;
  } catch (error) {
    logger.error(`Error loading test case: ${testCasePath}`);
    throw error;
  }
};

/**
 * Load all test cases from a directory.
 * @param testCasesDir The directory containing the test cases.
 * @returns The test cases.
 */
export const loadTestCases = async (
  testCasesDir: string
): Promise<TestCase[]> => {
  try {
    const testFiles = (await readdir(testCasesDir)).filter((file) =>
      file.endsWith(".json")
    );

    return Promise.all(
      testFiles.map(
        async (file) => await loadTestCase(path.join(testCasesDir, file))
      )
    );
  } catch (error) {
    logger.error(`Error loading test cases from: ${testCasesDir}`);
    throw error;
  }
};
