import { describe, expect, it } from 'bun:test';
import type { PromptFile, ReviewFile } from '../../../../common/types';
import { createPromptFiles } from '../chunkPrompts';

describe('createPromptFiles', () => {
  const baseFileContentLines = [
    'Line 1',
    'Line 2',
    'Line 3',
    'Line 4',
    'Line 5',
    'Line 6',
    'Line 7',
    'Line 8',
    'Line 9',
    'Line 10',
  ];

  const createTestFile = (
    fileName: string,
    contentLines: string[],
    changedLines: string[]
  ): ReviewFile => ({
    fileName,
    fileContent: contentLines.join('\n'),
    changedLines: changedLines.join('\n'),
  });

  it('should create a prompt with changes in the middle, expanding context', () => {
    const changedLine = '+Line 5 changed';
    const fileContentWithChange = [
      ...baseFileContentLines.slice(0, 4),
      changedLine.substring(1),
      ...baseFileContentLines.slice(5),
    ];
    const file = createTestFile('test.txt', fileContentWithChange, [changedLine]);
    const maxPromptPayloadLength = 100;

    const expectedPrompt: PromptFile = {
      fileName: 'test.txt',
      promptContent: [
        'Line 1',
        'Line 2',
        'Line 3',
        'Line 4',
        changedLine,
        'Line 6',
        'Line 7',
        'Line 8',
        'Line 9',
        'Line 10',
      ].join('\n'),
    };
    const result = createPromptFiles([file], maxPromptPayloadLength);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(expectedPrompt);
  });

  it('should create a prompt with changes at the beginning, limited expansion', () => {
    const changedLine = '+Line 1 changed';
    const fileContentWithChange = [changedLine.substring(1), ...baseFileContentLines.slice(1)];
    const file = createTestFile('test.txt', fileContentWithChange, [changedLine]);
    const maxPromptPayloadLength = 50;

    const expectedPrompt: PromptFile = {
      fileName: 'test.txt',
      promptContent: [changedLine, 'Line 2', 'Line 3', 'Line 4', '...'].join('\n'),
    };
    const result = createPromptFiles([file], maxPromptPayloadLength);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(expectedPrompt);
  });

  it('should create a prompt with changes at the end, limited expansion', () => {
    const changedLine = '+Line 10 changed';
    const fileContentWithChange = [...baseFileContentLines.slice(0, 9), changedLine.substring(1)];
    const file = createTestFile('test.txt', fileContentWithChange, [changedLine]);
    const maxPromptPayloadLength = 60;

    const expectedPrompt: PromptFile = {
      fileName: 'test.txt',
      promptContent: ['...', 'Line 5', 'Line 6', 'Line 7', 'Line 8', 'Line 9', changedLine].join(
        '\n'
      ),
    };
    const result = createPromptFiles([file], maxPromptPayloadLength);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(expectedPrompt);
  });

  it('should use maxSurroundingLines when provided', () => {
    const changedLine = '+Line 5 changed';
    const fileContentWithChange = [
      ...baseFileContentLines.slice(0, 4),
      changedLine.substring(1),
      ...baseFileContentLines.slice(5),
    ];
    const file = createTestFile('test.txt', fileContentWithChange, [changedLine]);
    const maxPromptPayloadLength = 500;
    const maxSurroundingLines = 2;

    const expectedPrompt: PromptFile = {
      fileName: 'test.txt',
      promptContent: ['...', 'Line 3', 'Line 4', changedLine, 'Line 6', 'Line 7', '...'].join('\n'),
    };
    const result = createPromptFiles([file], maxPromptPayloadLength, maxSurroundingLines);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(expectedPrompt);
  });

  it('should handle maxSurroundingLines near file boundaries', () => {
    const changedLine1 = '+Line 2 changed';
    const changedLine2 = '+Line 9 changed';
    const fileContentWithChange = [
      baseFileContentLines[0],
      changedLine1.substring(1),
      ...baseFileContentLines.slice(2, 8),
      changedLine2.substring(1),
      baseFileContentLines[9],
    ];
    const file = createTestFile('test.txt', fileContentWithChange, [changedLine1, changedLine2]);
    const maxPromptPayloadLength = 500;
    const maxSurroundingLines = 3;

    const expectedPrompt: PromptFile = {
      fileName: 'test.txt',
      promptContent: [
        'Line 1',
        changedLine1,
        'Line 3',
        'Line 4',
        'Line 5',
        'Line 6',
        'Line 7',
        'Line 8',
        changedLine2,
        'Line 10',
      ].join('\n'),
    };
    const result = createPromptFiles([file], maxPromptPayloadLength, maxSurroundingLines);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(expectedPrompt);
  });

  it('should return an empty array if no files are provided', () => {
    const result = createPromptFiles([], 100);
    expect(result).toEqual([]);
  });

  it('should return an empty array if file has no changed lines identified', () => {
    const file = createTestFile('test.txt', ['Line A', 'Line B'], ['+Line C']);
    const result = createPromptFiles([file], 100);
    expect(result).toEqual([]);
  });

  it('should handle multiple files', () => {
    const changed1 = '+B changed';
    const file1 = createTestFile('file1.txt', ['A', changed1.substring(1), 'C'], [changed1]);
    const changed2 = '+Y changed';
    const file2 = createTestFile('file2.txt', ['X', changed2.substring(1), 'Z'], [changed2]);

    const maxPromptPayloadLength = 30;

    const expectedPrompt1: PromptFile = {
      fileName: 'file1.txt',
      promptContent: ['A', changed1, 'C'].join('\n'),
    };

    const expectedPrompt2: PromptFile = {
      fileName: 'file2.txt',
      promptContent: ['X', changed2, 'Z'].join('\n'),
    };
    const result = createPromptFiles([file1, file2], maxPromptPayloadLength);
    expect(result).toHaveLength(2);
    expect(result).toEqual([expectedPrompt1, expectedPrompt2]);
  });

  it('should handle prompt exactly fitting the payload limit without expansion', () => {
    const changedLine = '+Line 2 changed';
    const fileContentWithChange = ['Line 1', changedLine.substring(1), 'Line 3'];
    const file = createTestFile('test.txt', fileContentWithChange, [changedLine]);
    const maxPromptPayloadLength = 24;

    const expectedPrompt: PromptFile = {
      fileName: 'test.txt',
      promptContent: ['...', changedLine, '...'].join('\n'),
    };
    const result = createPromptFiles([file], maxPromptPayloadLength);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(expectedPrompt);
  });

  it('should add ellipsis correctly when change is at the very beginning or end', () => {
    const changed1 = '+L1 changed';
    const changed2 = '+L5 changed';
    const fileContentWithChange = [changed1.substring(1), 'L2', 'L3', 'L4', changed2.substring(1)];
    const file = createTestFile('edge.txt', fileContentWithChange, [changed1, changed2]);
    const maxPromptPayloadLength = 40;

    const expectedPrompt: PromptFile = {
      fileName: 'edge.txt',
      promptContent: [changed1, 'L2', 'L3', 'L4', changed2].join('\n'),
    };
    const result = createPromptFiles([file], maxPromptPayloadLength);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(expectedPrompt);
  });
});
