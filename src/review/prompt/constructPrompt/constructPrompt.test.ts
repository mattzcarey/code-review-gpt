import { readFile } from "fs/promises";
import { join } from "path";
import { constructPromptsArray } from "./constructPrompt";

describe("When a file is longer than the max prompt length", () => {
  jest.setTimeout(30000);
  test("constructPromptsArray splits up the file into prompts", async () => {
    const testFilePath = join(__dirname, "../../../testFiles/longFile.tsx");
    const testFileContent = await readFile(testFilePath, "utf8");
    const files = [
      {
        fileName: testFilePath,
        fileContent: testFileContent,
        changedLines: testFileContent,
      },
    ];
    const maxPromptLength = 2000;
    const stringifyMargin = 1.2;

    const result = await constructPromptsArray(files, maxPromptLength);

    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBeGreaterThan(0);
    console.log(result[0]);

    for (const prompt of result) {
      expect(prompt.length).toBeLessThanOrEqual(
        maxPromptLength * stringifyMargin
      );
    }
  });
});
