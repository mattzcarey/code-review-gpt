import { readdir, readFile } from "fs/promises";
import { join } from "path";

import { filterFiles } from "./filterFiles";
import { ReviewFile } from "../../../common/types";

describe("filterFiles unit test", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("returns only supported files", async () => {
    const testDir = join(__dirname, "../../../testFiles");

    const testFiles: ReviewFile[] = [];

    const readDir = await readdir(testDir);

    await Promise.all(
      readDir.map(async (file) => {
        const fileName = join(testDir, file);
        const fileContent = await readFile(fileName, "utf8");
        testFiles.push({
          fileName: fileName,
          fileContent: fileContent,
          changedLines: fileContent,
        });
      })
    );

    const result = filterFiles(testFiles);
    const filesRegex = new RegExp(
      `(src/testFiles/longFile.tsx|src/testFiles/initialFilesExample.ts)`,
      "i"
    );

    expect(result.length).toEqual(2);
    expect(result[0].fileName).toMatch(filesRegex);
    expect(result[1].fileName).toMatch(filesRegex);
  });
});
