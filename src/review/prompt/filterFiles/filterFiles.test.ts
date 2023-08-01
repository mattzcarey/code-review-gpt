import { readdir, readFile } from "fs/promises";
import { join } from "path";
import { File } from "../../../common/types";
import { filterFiles } from "./filterFiles";

describe("filterFiles unit test", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("returns only supported files", async () => {
    const testDir = join(__dirname, "../../../testFiles");

    const testFiles: File[] = [];

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

    const result = await filterFiles(testFiles);

    expect(result.length).toEqual(1);
    expect(result[0].fileName).toBe(
      join(__dirname, "../../../testFiles", "longFile.tsx")
    );
  });
});
