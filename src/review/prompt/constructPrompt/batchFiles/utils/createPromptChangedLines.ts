import { PromptFile, ReviewFile } from "../../../../../common/types";

export const createPromptFiles = (
  files: ReviewFile[],
  maxPromptPayloadLength: number,
  maxSurroundingLines?: number
): PromptFile[] => {
  return files.map((file) => {
    const contentLines = file.fileContent.split("\n");
    const changedLinesArray = file.changedLines.split("\n");

    // Map changed lines to their indices and calculate the total length
    const changedIndices: { [index: number]: string } = {};
    let totalChangedLinesLength = 0;
    changedLinesArray.forEach((changedLine) => {
      const lineContent = changedLine.substring(1).trim();
      const index = contentLines.findIndex(
        (line) => line.trim() === lineContent
      );
      if (index !== -1) {
        changedIndices[index] = changedLine;
        totalChangedLinesLength += changedLine.length + 1; // Include newline character
      }
    });

    // Calculate remaining space for surrounding lines
    let remainingSpace =
      maxPromptPayloadLength - totalChangedLinesLength - file.fileName.length;

    let start = Math.max(
      Math.min(...Object.keys(changedIndices).map(Number)) -
        (maxSurroundingLines || 0),
      0 // Ensure start is non-negative
    );
    let end = Math.min(
      Math.max(...Object.keys(changedIndices).map(Number)) +
        (maxSurroundingLines || 0),
      contentLines.length - 1 // Ensure end is within contentLines range
    );

    while (remainingSpace > 0 && (start > 0 || end < contentLines.length - 1)) {
      if (start > 0) {
        const length = contentLines[start - 1].length + 1;
        if (length <= remainingSpace) {
          start--;
          remainingSpace -= length;
        }
      }
      if (end < contentLines.length - 1) {
        const length = contentLines[end + 1].length + 1;
        if (length <= remainingSpace) {
          end++;
          remainingSpace -= length;
        }
      }
      if (start === 0 && end === contentLines.length - 1) {
        break;
      }
    }

    let promptContent = "";
    for (let i = start; i <= end; i++) {
      promptContent += (changedIndices[i] || contentLines[i]) + "\n";
    }

    return {
      fileName: file.fileName,
      promptContent: promptContent.trim(),
    };
  });
};
