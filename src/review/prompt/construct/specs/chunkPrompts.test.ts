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

  it('should include full hunks regardless of maxSurroundingLines (which is ignored)', () => {
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
      promptContent: expectContent(hunk1), // Expect the full hunk
    };
    const result = createPromptFiles([file], maxPromptPayloadLength);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(expectedPrompt);
  });

  it('should split into two parts if accumulated hunks exceed limit', () => {
    const hunk1 = ['@@ -1,4 +1,4 @@', '-Line 1', '+Line 1 changed', ' Line 2', ' Line 3'];
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

    const maxPromptPayloadLength = 100;
    const result = createPromptFiles([file], maxPromptPayloadLength);
    expect(result).toHaveLength(2);
    expect(result).toEqual([
      {
        fileName: 'long_file_name.txt (part 1)',
        promptContent: expectContent(hunk1),
      },
      {
        fileName: 'long_file_name.txt (part 2)',
        promptContent: expectContent(hunk2),
      },
    ]);
  });

  it('should skip a hunk that individually exceeds maxChunkContentLength', () => {
    const hunk1 = ['@@ -1,1 +1,1 @@', '-Small', '+Smaller'];
    const largeLine = 'A'.repeat(80);
    const hunk2 = ['@@ -10,1 +10,1 @@', `-${largeLine}`, `+${largeLine} changed`];

    const rawDiff = expectContent([...hunk1, ...hunk2]);
    const file = createTestFile('skip_large.txt', rawDiff);

    const maxPromptPayloadLength = 100;
    const result = createPromptFiles([file], maxPromptPayloadLength);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      fileName: 'skip_large.txt',
      promptContent: expectContent(hunk1),
    });
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

  it('should return an empty array if file has no changed lines in any hunk', () => {
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
    const hunk1_f1 = ['@@ -1,3 +1,3 @@', ' A', '-B', '+B changed', ' C'];
    const hunk1_f2 = ['@@ -1,3 +1,3 @@', ' X', '-Y', '+Y changed', ' Z'];
    const rawDiff1 = expectContent(hunk1_f1);
    const rawDiff2 = expectContent(hunk1_f2);
    const file1 = createTestFile('file1.txt', rawDiff1);
    const file2 = createTestFile('file2.txt', rawDiff2);

    const maxPromptPayloadLength = 70;
    const result = createPromptFiles([file1, file2], maxPromptPayloadLength);
    expect(result).toHaveLength(2);
    expect(result).toEqual([
      {
        fileName: 'file1.txt',
        promptContent: expectContent(hunk1_f1),
      },
      {
        fileName: 'file2.txt',
        promptContent: expectContent(hunk1_f2),
      },
    ]);
  });

  it('should handle multiple files requiring chunking', () => {
    const hunk1_f1 = ['@@ -1,4 +1,4 @@', '-Line 1', '+Line 1 changed', ' Line 2', ' Line 3'];
    const hunk2_f1 = ['@@ -7,4 +7,4 @@', ' Line 7', ' Line 8', '-Line 9', '+Line 9 changed'];
    const rawDiff1 = expectContent([...hunk1_f1, ...hunk2_f1]);

    const hunk1_f2 = ['@@ -1,3 +1,3 @@', ' X', '-Y', '+Y changed', ' Z'];
    const rawDiff2 = expectContent(hunk1_f2);

    const file1 = createTestFile('needs_chunk.txt', rawDiff1);
    const file2 = createTestFile('no_chunk.txt', rawDiff2);

    const maxPromptPayloadLength = 100;
    const result = createPromptFiles([file1, file2], maxPromptPayloadLength);
    expect(result).toHaveLength(3);
    expect(result).toEqual([
      {
        fileName: 'needs_chunk.txt (part 1)',
        promptContent: expectContent(hunk1_f1),
      },
      {
        fileName: 'needs_chunk.txt (part 2)',
        promptContent: expectContent(hunk2_f1),
      },
      {
        fileName: 'no_chunk.txt',
        promptContent: expectContent(hunk1_f2),
      },
    ]);
  });
});
