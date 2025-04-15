import { describe, expect, it } from 'bun:test';
import type { PromptFile, ReviewFile } from '../../../../common/types';
import { createPromptFiles } from '../chunkPrompts';

describe('createPromptFiles', () => {
  // Helper to create a ReviewFile with rawDiff
  const createTestFile = (fileName: string, rawDiff: string): ReviewFile => ({
    fileName,
    fileContent: '', // No longer directly used by createPromptFiles
    rawDiff: rawDiff,
  });

  // Helper function to join lines for expectation clarity
  const expectContent = (lines: string[]): string => lines.join('\n');

  it('should create a single prompt if diff fits within limit', () => {
    const hunk1 = [
      '@@ -2,7 +2,7 @@',
      ' Line 2',
      ' Line 3',
      ' Line 4',
      '-Line 5',
      '+Line 5 changed',
      ' Line 6',
      ' Line 7',
      ' Line 8',
    ];
    const rawDiff = expectContent(hunk1);
    const file = createTestFile('test.txt', rawDiff);
    const maxPromptPayloadLength = 200; // Plenty of space

    const expectedPrompt: PromptFile = {
      fileName: 'test.txt',
      promptContent: expectContent(hunk1), // Expect the full hunk
    };
    const result = createPromptFiles([file], maxPromptPayloadLength);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(expectedPrompt);
  });

  it('should ignore maxSurroundingLines and include full hunks', () => {
    const hunk1 = [
      '@@ -2,7 +2,7 @@',
      ' Line 2',
      ' Line 3',
      ' Line 4',
      '-Line 5',
      '+Line 5 changed',
      ' Line 6',
      ' Line 7',
      ' Line 8',
    ];
    const rawDiff = expectContent(hunk1);
    const file = createTestFile('test.txt', rawDiff);
    const maxPromptPayloadLength = 500; // Plenty of space
    const maxSurroundingLines = 1; // Should be ignored

    const expectedPrompt: PromptFile = {
      fileName: 'test.txt',
      promptContent: expectContent(hunk1), // Expect the full hunk, not limited context
    };
    const result = createPromptFiles([file], maxPromptPayloadLength, maxSurroundingLines);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(expectedPrompt);
  });

  it('should split into two parts if hunks exceed limit', () => {
    // Hunk 1: Header(17) + 8 lines * ~8 chars = ~64 + 17 = ~81 + 9 newlines = 90
    const hunk1 = ['@@ -1,4 +1,4 @@', '-Line 1', '+Line 1 changed', ' Line 2', ' Line 3'];
    // Hunk 2: Header(17) + 6 lines * ~8 chars = ~48 + 17 = ~65 + 7 newlines = 72
    const hunk2 = [
      '@@ -7,3 +7,4 @@',
      ' Line 7',
      ' Line 8',
      '-Line 9',
      '+Line 9 new',
      '+Line 9 changed',
    ];
    const rawDiff = expectContent([...hunk1, ...hunk2]);
    const file = createTestFile('long_file_name.txt', rawDiff);

    // Estimate lengths roughly: hunk1 ~90, hunk2 ~72. Total content ~162
    // Filename reserve: len("long_file_name.txt")=18. 18+1(newline)+10(part N) = 29
    const maxPromptPayloadLength = 150; // Requires splitting. Max content = 150 - 29 = 121
    // Hunk1 (90) fits in first chunk. Adding Hunk2 (72) exceeds 121.

    const expectedPrompt1: PromptFile = {
      fileName: 'long_file_name.txt (part 1)',
      promptContent: expectContent(hunk1),
    };
    const expectedPrompt2: PromptFile = {
      fileName: 'long_file_name.txt (part 2)',
      promptContent: expectContent(hunk2),
    };

    const result = createPromptFiles([file], maxPromptPayloadLength);
    expect(result).toHaveLength(2);
    expect(result).toEqual([expectedPrompt1, expectedPrompt2]);
  });

  it('should handle a single hunk exceeding the limit', () => {
    // Hunk 1: Header(17) + 8 lines * ~8 chars = ~64 + 17 = ~81 + 9 newlines = 90
    const hunk1 = [
      '@@ -1,8 +1,8 @@',
      ' Line 1',
      ' Line 2',
      ' Line 3',
      '-Line 4',
      '+Line 4 changed',
      ' Line 6',
      ' Line 7',
      ' Line 8',
    ];
    const rawDiff = expectContent(hunk1);
    const file = createTestFile('oversized_hunk.txt', rawDiff);

    // Filename reserve: len("oversized_hunk.txt")=18. 18+1+10 = 29
    const maxPromptPayloadLength = 100; // Hunk1 (90) exceeds Max content = 100 - 29 = 71
    // Expect the oversized hunk to be sent as a single chunk anyway (with warning logged)

    const expectedPrompt: PromptFile = {
      fileName: 'oversized_hunk.txt', // Not split as it's a single hunk
      promptContent: expectContent(hunk1),
    };

    const result = createPromptFiles([file], maxPromptPayloadLength);
    // Check logger for warning here? For now, just expect the file.
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(expectedPrompt);
  });

  it('should create a prompt with only a deleted line in the middle', () => {
    const hunk1 = [
      '@@ -2,7 +2,6 @@',
      ' Line 2',
      ' Line 3',
      ' Line 4',
      '-Line 5',
      ' Line 6',
      ' Line 7',
      ' Line 8',
    ];
    const rawDiff = expectContent(hunk1);
    const file = createTestFile('test.txt', rawDiff);
    const maxPromptPayloadLength = 100; // Sufficient length

    const expectedPrompt: PromptFile = {
      fileName: 'test.txt',
      promptContent: expectContent(hunk1),
    };

    const result = createPromptFiles([file], maxPromptPayloadLength);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(expectedPrompt);
  });

  it('should return an empty array if no files are provided', () => {
    const result = createPromptFiles([], 100);
    expect(result).toEqual([]);
  });

  it('should return an empty array if file has no changed lines identified in diff', () => {
    // Diff with only context lines and hunk header
    const rawDiff = expectContent(['@@ -1,3 +1,3 @@', ' Line A', ' Line B', ' Line C']);
    const file = createTestFile('test.txt', rawDiff);
    const result = createPromptFiles([file], 100);
    expect(result).toEqual([]);
  });

  it('should return an empty array if rawDiff contains only git headers', () => {
    const rawDiff = expectContent([
      'diff --git a/test.txt b/test.txt',
      'index 123..456 100644',
      '--- a/test.txt',
      '+++ b/test.txt',
    ]);
    const file = createTestFile('test.txt', rawDiff);
    const result = createPromptFiles([file], 100);
    expect(result).toEqual([]);
  });

  it('should return an empty array if rawDiff is empty', () => {
    const file = createTestFile('test.txt', '');
    const result = createPromptFiles([file], 100);
    expect(result).toEqual([]);
  });

  it('should handle multiple files, potentially chunking them', () => {
    const hunk1_f1 = ['@@ -1,3 +1,3 @@', ' A', '-B', '+B changed', ' C']; // ~31 chars + header
    const hunk1_f2 = ['@@ -1,3 +1,3 @@', ' X', '-Y', '+Y changed', ' Z']; // ~31 chars + header
    const rawDiff1 = expectContent(hunk1_f1);
    const rawDiff2 = expectContent(hunk1_f2);
    const file1 = createTestFile('file1.txt', rawDiff1);
    const file2 = createTestFile('file2.txt', rawDiff2);

    // Hunk length ~ 17 + 3 + 3 + 11 + 3 = 37
    // Filename reserve ~ 11+10 = 21
    const maxPromptPayloadLength = 70; // Hunk (37) fits within max content (70-21=49)

    const expectedPrompt1: PromptFile = {
      fileName: 'file1.txt',
      promptContent: expectContent(hunk1_f1),
    };

    const expectedPrompt2: PromptFile = {
      fileName: 'file2.txt',
      promptContent: expectContent(hunk1_f2),
    };
    const result = createPromptFiles([file1, file2], maxPromptPayloadLength);
    expect(result).toHaveLength(2);
    expect(result).toEqual([expectedPrompt1, expectedPrompt2]);
  });

  it('should handle multiple files requiring chunking', () => {
    // Hunk 1: Header(17) + 4 lines * ~8 chars = ~32 + 17 = ~49 + 5 nl = 54
    const hunk1_f1 = ['@@ -1,4 +1,4 @@', '-Line 1', '+Line 1 changed', ' Line 2', ' Line 3'];
    // Hunk 2: Header(17) + 4 lines * ~8 chars = ~32 + 17 = ~49 + 5 nl = 54
    const hunk2_f1 = ['@@ -7,4 +7,4 @@', ' Line 7', ' Line 8', '-Line 9', '+Line 9 changed'];
    const rawDiff1 = expectContent([...hunk1_f1, ...hunk2_f1]); // Total content ~108

    const hunk1_f2 = ['@@ -1,3 +1,3 @@', ' X', '-Y', '+Y changed', ' Z']; // Hunk length ~37
    const rawDiff2 = expectContent(hunk1_f2);

    const file1 = createTestFile('needs_chunk.txt', rawDiff1);
    const file2 = createTestFile('no_chunk.txt', rawDiff2);

    // Filename reserve: needs_chunk.txt (15+1+10=26), no_chunk.txt (12+1+10=23)
    const maxPromptPayloadLength = 100;
    // File1: Max content = 100-26=74. Hunk1 (54) fits. Add Hunk2 (54) > 74. Split.
    // File2: Max content = 100-23=77. Hunk1 (37) fits. No split.

    const expectedPrompt1_part1: PromptFile = {
      fileName: 'needs_chunk.txt (part 1)',
      promptContent: expectContent(hunk1_f1),
    };
    const expectedPrompt1_part2: PromptFile = {
      fileName: 'needs_chunk.txt (part 2)',
      promptContent: expectContent(hunk2_f1),
    };
    const expectedPrompt2: PromptFile = {
      fileName: 'no_chunk.txt',
      promptContent: expectContent(hunk1_f2),
    };

    const result = createPromptFiles([file1, file2], maxPromptPayloadLength);
    expect(result).toHaveLength(3);
    expect(result).toEqual([expectedPrompt1_part1, expectedPrompt1_part2, expectedPrompt2]);
  });

  // Add more tests for edge cases if needed:
  // - Very small maxPromptPayloadLength
  // - Files with many small hunks vs few large hunks
  // - Diff containing "\\ No newline at end of file"
});
