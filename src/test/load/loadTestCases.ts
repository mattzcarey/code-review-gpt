import { readFileSync, readdirSync } from "fs";
import path from "path";
import { TestCase } from "../types";

const loadTestCase = (testCasePath: string): TestCase => {
  try {
    const fileData = readFileSync(testCasePath, "utf8");
    return JSON.parse(fileData) as TestCase;
  } catch (error) {
    console.error(`Error loading test case: ${testCasePath}`);
    throw error;
  }
};

export const loadTestCases = (testCasesDir: string): TestCase[] => {
  try {
    const testFiles = readdirSync(testCasesDir).filter((file) =>
      file.endsWith(".json")
    );

    return testFiles.map((file) => loadTestCase(path.join(testCasesDir, file)));
  } catch (error) {
    console.error(`Error loading test cases from: ${testCasesDir}`);
    throw error;
  }
};
