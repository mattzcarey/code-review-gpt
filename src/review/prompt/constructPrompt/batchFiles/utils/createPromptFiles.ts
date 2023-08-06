import { PromptFile, ReviewFile } from "../../../../../common/types";

const getChangedIndicesAndLength = (
  contentLines: string[],
  changedLinesArray: string[]
) => {
  // Map changed lines to their indices and calculate the total length
  const changedIndices: { [index: number]: string } = {};
  let totalChangedLinesLength = 0;
  changedLinesArray.forEach((changedLine) => {
    const lineContent = changedLine.substring(1).trim();
    const index = contentLines.findIndex((line) => line.trim() === lineContent);
    if (index !== -1) {
      changedIndices[index] = changedLine;
      totalChangedLinesLength += changedLine.length + 1; // Include newline character
    }
  });
  return { changedIndices, totalChangedLinesLength };
};

const calculateStartAndEnd = (
  changedIndices: { [index: number]: string },
  contentLinesLength: number,
  maxSurroundingLines?: number
) => {
  let start = Math.max(
    Math.min(...Object.keys(changedIndices).map(Number)) -
      (maxSurroundingLines || 0),
    0
  );
  let end = Math.min(
    Math.max(...Object.keys(changedIndices).map(Number)) +
      (maxSurroundingLines || 0),
    contentLinesLength - 1
  );
  return { start, end };
};

const expandRange = (
  start: number,
  end: number,
  contentLines: string[],
  remainingSpace: number
) => {
  // Define flags to control the alternating expansion
  let expandStart = true;
  let expandEnd = true;

  while (remainingSpace > 0 && (expandStart || expandEnd)) {
    if (expandStart && start > 0) {
      const length = contentLines[start - 1].length + 1;
      if (length <= remainingSpace) {
        start--;
        remainingSpace -= length;
      } else {
        expandStart = false;
      }
    }

    if (expandEnd && end < contentLines.length - 1) {
      const length = contentLines[end + 1].length + 1;
      if (length <= remainingSpace) {
        end++;
        remainingSpace -= length;
      } else {
        expandEnd = false;
      }
    }

    if (
      (start === 0 || !expandStart) &&
      (end === contentLines.length - 1 || !expandEnd)
    ) {
      break;
    }

    if (start === 0) expandStart = false;
    if (end === contentLines.length - 1) expandEnd = false;
  }

  return { start, end };
};

const createPromptContent = (
  start: number,
  end: number,
  changedIndices: { [index: number]: string },
  contentLines: string[]
) => {
  let promptContent = "";

  // Add ellipsis if there are skipped lines before the start
  if (start > 0) {
    promptContent += "...\n";
  }

  // Iterate only through the relevant lines (from start to end)
  for (let i = start; i <= end; i++) {
    promptContent += (changedIndices[i] || contentLines[i]) + "\n";
  }

  // Add ellipsis if there are skipped lines after the end
  if (end < contentLines.length - 1) {
    promptContent += "...\n";
  }

  return promptContent.trim();
};

export const createPromptFiles = (
  files: ReviewFile[],
  maxPromptPayloadLength: number,
  maxSurroundingLines?: number
): PromptFile[] => {
  return files.map((file) => {
    const contentLines = file.fileContent.split("\n");
    const changedLinesArray = file.changedLines.split("\n");

    const { changedIndices, totalChangedLinesLength } =
      getChangedIndicesAndLength(contentLines, changedLinesArray);
    let remainingSpace =
      maxPromptPayloadLength - totalChangedLinesLength - file.fileName.length;
    let { start, end } = calculateStartAndEnd(
      changedIndices,
      contentLines.length,
      maxSurroundingLines
    );
    ({ start, end } = expandRange(start, end, contentLines, remainingSpace));
    const promptContent = createPromptContent(
      start,
      end,
      changedIndices,
      contentLines
    );

    return {
      fileName: file.fileName,
      promptContent: promptContent,
    };
  });
};
