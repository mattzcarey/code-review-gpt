import { describe, expect, test } from 'bun:test';
import { join } from 'path';
import { readFile, readdir } from 'fs/promises';

import type { ReviewFile } from '../../../common/types';
import { filterFiles } from '../filterFiles';

describe('filterFiles unit test', () => {
  test('returns only supported files', async () => {
    const testDir = join(__dirname, 'examples');

    const testFiles: ReviewFile[] = [];

    const readDir = await readdir(testDir);

    await Promise.all(
      readDir.map(async (file) => {
        const fileName = join(testDir, file);
        const fileContent = await readFile(fileName, 'utf8');
        testFiles.push({
          fileName: fileName,
          fileContent: fileContent,
          changedLines: [],
        });
      })
    );

    const result = filterFiles(testFiles);
    const filesRegex = /examples\/(longFile\.tsx|initialFilesExample\.ts)$/i;

    expect(result.length).toEqual(2);
    expect(result[0].fileName).toMatch(filesRegex);
    expect(result[1].fileName).toMatch(filesRegex);
  });
});
