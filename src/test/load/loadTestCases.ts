import { readFileSync, readdirSync } from "fs";
import path from "path";
import { TestCase } from "../types";
import { logger } from "../../common/utils/logger";

/**
 * Load a single test case defined in a JSON file.
 * @param testCasePath The path to the JSON test case file.
 * @returns The test case.
 */
const loadTestCase = (testCasePath: string): TestCase => {
  try {
    const fileData = readFileSync(testCasePath, "utf8");
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
export const loadTestCases = (testCasesDir: string): TestCase[] => {
  try {
    const testFiles = readdirSync(testCasesDir).filter((file) =>
      file.endsWith(".json")
    );

    return testFiles.map((file) => loadTestCase(path.join(testCasesDir, file)));
  } catch (error) {
    logger.error(`Error loading test cases from: ${testCasesDir}`);
    throw error;
  }
};
