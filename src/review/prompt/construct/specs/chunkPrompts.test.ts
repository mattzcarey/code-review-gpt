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
    reviewType: 'changed',
  });

  it('should create a prompt with changes in the middle, expanding context', () => {
    const changedLine = '+Line 5 changed';
    const fileContentWithChange = [
      ...baseFileContentLines.slice(0, 4),
      changedLine.substring(1), // Use the actual changed content
      ...baseFileContentLines.slice(5),
    ];
    const file = createTestFile('test.txt', fileContentWithChange, [changedLine]);
    const maxPromptPayloadLength = 100;

    // Calculation check:
    // Changed line length: '+Line 5 changed' (15) + 1 newline = 16
    // Filename length: 'test.txt' (8)
    // Base payload = 16 + 8 = 24
    // Remaining space = 100 - 24 = 76
    // Min/Max index of change = 4
    // Initial start/end = 4
    // Expand start: Need L4(6)+1=7. Remaining 69. Start=3
    // Expand end: Need L6(6)+1=7. Remaining 62. End=5
    // Expand start: Need L3(6)+1=7. Remaining 55. Start=2
    // Expand end: Need L7(6)+1=7. Remaining 48. End=6
    // Expand start: Need L2(6)+1=7. Remaining 41. Start=1
    // Expand end: Need L8(6)+1=7. Remaining 34. End=7
    // Expand start: Need L1(6)+1=7. Remaining 27. Start=0
    // Expand end: Need L9(6)+1=7. Remaining 20. End=8
    // Expand end: Need L10(7)+1=8. Remaining 12. End=9
    // -> Includes entire file, no ellipsis
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
    // Changed Length: 15+1=16. Filename 8. Total=24. Remaining=26.
    // Min/Max index = 0. Initial start/end=0.
    // Expand end: L2(6)+1=7. Rem 19. End=1
    // Expand end: L3(6)+1=7. Rem 12. End=2
    // Expand end: L4(6)+1=7. Rem 5. End=3 -> Cannot add L5(6)+1=7
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
    // Changed Length: 16+1=17. Filename 8. Total=25. Remaining=35.
    // Min/Max index = 9. Initial start/end=9.
    // Expand start: L9(6)+1=7. Rem 28. Start=8
    // Expand start: L8(6)+1=7. Rem 21. Start=7
    // Expand start: L7(6)+1=7. Rem 14. Start=6
    // Expand start: L6(6)+1=7. Rem 7. Start=5 -> Cannot add L5(6)+1=7
    const expectedPrompt: PromptFile = {
      fileName: 'test.txt',
      promptContent: ['...', 'Line 6', 'Line 7', 'Line 8', 'Line 9', changedLine].join('\n'),
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
    const maxPromptPayloadLength = 500; // Large enough
    const maxSurroundingLines = 2;
    // Change index = 4. Start = max(4-2, 0) = 2. End = min(4+2, 9) = 6
    const expectedPrompt: PromptFile = {
      fileName: 'test.txt',
      promptContent: [
        '...',
        'Line 3', // Index 2
        'Line 4', // Index 3
        changedLine, // Index 4
        'Line 6', // Index 5
        'Line 7', // Index 6
        '...',
      ].join('\n'),
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
    // Change 1 index = 1. Change 2 index = 8.
    // Start = max(1-3, 0) = 0. End = min(8+3, 9) = 9
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
      ].join('\n'), // Should include whole file
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
    // Content does not contain the changed line
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
    // File1: Changed(10)+1=11. Name(9). Total=20. Remain=10.
    // Min/Max=1. Initial start/end=1.
    // Expand start: A(1)+1=2. Rem=8. Start=0.
    // Expand end: C(1)+1=2. Rem=6. End=2.
    const expectedPrompt1: PromptFile = {
      fileName: 'file1.txt',
      promptContent: ['A', changed1, 'C'].join('\n'),
    };
    // File2: Changed(10)+1=11. Name(9). Total=20. Remain=10.
    // Min/Max=1. Initial start/end=1.
    // Expand start: X(1)+1=2. Rem=8. Start=0.
    // Expand end: Z(1)+1=2. Rem=6. End=2.
    const expectedPrompt2: PromptFile = {
      fileName: 'file2.txt',
      promptContent: ['X', changed2, 'Z'].join('\n'),
    };
    const result = createPromptFiles([file1, file2], maxPromptPayloadLength);
    expect(result).toHaveLength(2);
    expect(result).toEqual([expectedPrompt1, expectedPrompt2]);
  });

  it('should handle prompt exactly fitting the payload limit without expansion', () => {
    const changedLine = '+Line 2 changed'; // 15 chars
    const fileContentWithChange = ['Line 1', changedLine.substring(1), 'Line 3'];
    const file = createTestFile('test.txt', fileContentWithChange, [changedLine]); // Name: 8 chars
    // Total length needed: filename(8) + changedLine(15) + newline(1) = 24
    const maxPromptPayloadLength = 24;
    // Changed Length 15+1=16. Filename 8. Total=24. Remaining=0.
    // Min/Max=1. Initial start/end=1. No expansion space.
    const expectedPrompt: PromptFile = {
      fileName: 'test.txt',
      promptContent: ['...', changedLine, '...'].join('\n'), // No space to expand
    };
    const result = createPromptFiles([file], maxPromptPayloadLength);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(expectedPrompt);
  });

  it('should add ellipsis correctly when change is at the very beginning or end', () => {
    const changed1 = '+L1 changed'; // 11
    const changed2 = '+L5 changed'; // 11
    const fileContentWithChange = [changed1.substring(1), 'L2', 'L3', 'L4', changed2.substring(1)];
    const file = createTestFile('edge.txt', fileContentWithChange, [changed1, changed2]); // Name: 8
    // Changed Length: (11+1) + (11+1) = 24. Filename 8. Total=32.
    const maxPromptPayloadLength = 40; // Remaining space = 8
    // Min=0, Max=4. Initial start=0, end=4.
    // Expand inside: Need L2(2)+1=3. Rem 5. Mid start = 1
    // Expand inside: Need L4(2)+1=3. Rem 2. Mid end = 3 -> Cannot expand L3(2)+1=3
    const expectedPrompt: PromptFile = {
      fileName: 'edge.txt',
      promptContent: [changed1, 'L2', '...', 'L4', changed2].join('\n'), // Expect middle ellipsis
    };
    const result = createPromptFiles([file], maxPromptPayloadLength);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(expectedPrompt);
  });
});
