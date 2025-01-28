import { describe, expect, test } from 'bun:test';
import { escapeFileName } from '../getChangedFileLines';

describe('escapeFileName', () => {
  test('escapes special characters in filenames', () => {
    const testCases = [
      ['normal.ts', '"normal.ts"'],
      ['has"quote.ts', '"has\\"quote.ts"'],
      ['has$dollar.ts', '"has\\$dollar.ts"'],
      ['has`backtick.ts', '"has\\`backtick.ts"'],
      ['has space.ts', '"has space.ts"'],
    ];

    for (const [input, expected] of testCases) {
      expect(escapeFileName(input)).toBe(expected);
    }
  });
});
