import { describe, expect, it } from 'bun:test';
import type { PromptFile } from '../../../../common/types';
import { type BatchPromptsResult, batchPrompts } from '../batchPrompts';

// Mock logger to prevent actual logging during tests
const mockLogger = {
  error: () => {},
  warn: () => {},
  info: () => {},
  debug: () => {},
};

global.logger = mockLogger; // Replace global logger if necessary, or inject

// Use the same constant as in the main file for consistency
const SAFE_PROMPT_BATCH_SIZE = 60000;

describe('batchPrompts', () => {
  const createFile = (name: string, content: string): PromptFile => ({
    fileName: name,
    promptContent: content,
  });

  it('should put all files in one batch if they fit under the limit', () => {
    const file1 = createFile('file1.txt', 'a'.repeat(10000)); // ~10k
    const file2 = createFile('file2.txt', 'b'.repeat(10000)); // ~10k
    const file3 = createFile('file3.txt', 'c'.repeat(10000)); // ~10k
    const promptFiles = [file1, file2, file3]; // Total ~30k < 60k
    const expectedResult: BatchPromptsResult = {
      batches: [[file1, file2, file3]],
      skippedFiles: [],
    };
    const result = batchPrompts(promptFiles);
    expect(result).toEqual(expectedResult);
  });

  it('should batch files correctly when they exceed the limit', () => {
    const file1 = createFile('file1.txt', 'a'.repeat(25000)); // ~25k
    const file2 = createFile('file2.txt', 'b'.repeat(25000)); // ~25k
    const file3 = createFile('file3.txt', 'c'.repeat(25000)); // ~25k
    const promptFiles = [file1, file2, file3];
    // Batch 1: file1 + file2 (~50k)
    // Batch 2: file3 (~25k)
    const expectedResult: BatchPromptsResult = {
      batches: [[file1, file2], [file3]],
      skippedFiles: [],
    };
    const result = batchPrompts(promptFiles);
    expect(result).toEqual(expectedResult);
  });

  it('should handle a single file larger than the limit', () => {
    const largeFile = createFile('large.txt', 'a'.repeat(70000)); // ~70k > 60k
    const promptFiles = [largeFile];
    const expectedResult: BatchPromptsResult = {
      batches: [],
      skippedFiles: [largeFile],
    };
    const result = batchPrompts(promptFiles);
    expect(result).toEqual(expectedResult);
  });

  it('should handle a mix of fitting files and one oversized file', () => {
    const file1 = createFile('f1.txt', 'c'.repeat(10000)); // ~10k
    const largeFile = createFile('large.txt', 'a'.repeat(70000)); // ~70k
    const file2 = createFile('f2.txt', 'c'.repeat(10000)); // ~10k
    const promptFiles = [file1, largeFile, file2];
    // Batch 1: file1 + file2 (~20k). Skip large.
    const expectedResult: BatchPromptsResult = {
      batches: [[file1, file2]],
      skippedFiles: [largeFile],
    };
    const result = batchPrompts(promptFiles);
    expect(result).toEqual(expectedResult);
  });

  it('should handle files that approach the limit', () => {
    const file1 = createFile('near1.txt', 'a'.repeat(SAFE_PROMPT_BATCH_SIZE - 100)); // Just under ~59909
    const file2 = createFile('near2.txt', 'b'.repeat(50)); // Small ~59
    const promptFiles = [file1, file2]; // Total ~59968 < 60000
    const expectedResult: BatchPromptsResult = {
      batches: [[file1, file2]], // Both should fit in one batch
      skippedFiles: [],
    };
    const result = batchPrompts(promptFiles);
    expect(result).toEqual(expectedResult);
  });

  it('should return empty result if no prompt files are provided', () => {
    const promptFiles: PromptFile[] = [];
    const expectedResult: BatchPromptsResult = {
      batches: [],
      skippedFiles: [],
    };
    const result = batchPrompts(promptFiles);
    expect(result).toEqual(expectedResult);
  });

  it('should correctly batch when a file equals the safe limit', () => {
    // Note: a file exactly equalling the limit is unlikely due to filename length,
    // but test the boundary condition.
    // Approximate size to be exactly the limit (adjust content length slightly)
    const fileName = 'exact_limit_file.txt'; // 20 chars
    const contentLength = SAFE_PROMPT_BATCH_SIZE - fileName.length; // 59980
    const exactFile = createFile(fileName, 'e'.repeat(contentLength)); // Size = 60000

    const file1 = createFile('f1.txt', 'c'.repeat(1000)); // ~1k
    const file2 = createFile('f2.txt', 'c'.repeat(1000)); // ~1k
    const promptFiles = [file1, exactFile, file2];

    const expectedResult: BatchPromptsResult = {
      batches: [[file1], [exactFile], [file2]], // Each fits or fills a batch
      skippedFiles: [],
    };
    const result = batchPrompts(promptFiles);
    expect(result).toEqual(expectedResult);
  });
});
