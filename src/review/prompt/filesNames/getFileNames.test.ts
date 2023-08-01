import { readdir } from "fs/promises";
import { join } from "path";
import { getFileNames } from "./getFileNames";
import * as getFileNamesFromGitModule from "./getFileNamesFromGit";

jest.mock("./getFileNamesFromGit");

describe("getFileNames unit test", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("returns only supported files", async () => {
    const testDir = join(__dirname, "../../../testFiles");

    const mockedGetFileNamesFromGit = jest.fn().mockImplementation(() => {
      return readdir(testDir).then((files) => {
        return files.map((file) => join(testDir, file));
      });
    });

    (getFileNamesFromGitModule as any).getFileNamesFromGit =
      mockedGetFileNamesFromGit;

    const result = await getFileNames(false);
    console.log("result -> ", result);

    expect(result).toEqual([
      join(__dirname, "../../../testFiles", "initialFilesExample.ts"),
      join(__dirname, "../../../testFiles", "longFile.tsx"),
    ]);
  });
});
