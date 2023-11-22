import { PromptFile, ReviewFile } from "../../../../../common/types";

const getChangedIndicesAndLength = (
  contentLines: string[],
  changedLinesArray: string[]
) => {
  const changedIndices: { [index: number]: string } = {};
  let totalChangedLinesLength = 0;
  let minIndex = Infinity;
  let maxIndex = -Infinity;

  // Create a map of trimmed content lines to their indices (arrays to handle duplicates)
  const trimmedContentLinesMap = new Map<string, number[]>();
  contentLines.forEach((line, index) => {
    const trimmedLine = line.trim();
    const indices = trimmedContentLinesMap.get(trimmedLine) || [];
    indices.push(index);
    trimmedContentLinesMap.set(trimmedLine, indices);
  });

  // Process the changed lines
  changedLinesArray.forEach((changedLine) => {
    const lineContent = changedLine.substring(1).trim();
    const indices = trimmedContentLinesMap.get(lineContent);
    if (indices && indices.length > 0) {
      const index = indices.shift()!; // Take the first occurrence
      changedIndices[index] = changedLine;
      totalChangedLinesLength += changedLine.length + 1;
      minIndex = Math.min(minIndex, index);
      maxIndex = Math.max(maxIndex, index);
    }
  });

  return { changedIndices, totalChangedLinesLength, minIndex, maxIndex };
};

const calculateStartAndEnd = (
  minIndex: number,
  maxIndex: number,
  contentLinesLength: number,
  maxSurroundingLines?: number
) => {
  // Calculate the starting and ending indices with surrounding lines considered
  const start = Math.max(minIndex - (maxSurroundingLines || 0), 0);
  const end = Math.min(
    maxIndex + (maxSurroundingLines || 0),
    contentLinesLength - 1
  );

  return { start, end };
};

// eslint-disable-next-line complexity
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

    if (start === 0) {expandStart = false;}
    if (end === contentLines.length - 1) {expandEnd = false;}
  }

  return { start, end };
};

const createPromptContent = (
  start: number,
  end: number,
  changedIndices: { [index: number]: string },
  contentLines: string[]
) => {
  let promptContent = start > 0 ? "...\n" : "";

  for (let i = start; i <= end; i++) {
    promptContent += (changedIndices[i] || contentLines[i]) + "\n";
  }

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
  return files.reduce((result: PromptFile[], file) => {
    const contentLines = file.fileContent.split("\n");
    const changedLinesArray = file.changedLines.split("\n");

    // Get the changed indices, total length, and min/max indices
    const { changedIndices, totalChangedLinesLength, minIndex, maxIndex } =
      getChangedIndicesAndLength(contentLines, changedLinesArray);

    if (totalChangedLinesLength === 0) {
      return result;
    }

    // Calculate remaining space and start/end positions
    const remainingSpace =
      maxPromptPayloadLength - totalChangedLinesLength - file.fileName.length;
    let { start, end } = calculateStartAndEnd(
      minIndex,
      maxIndex,
      contentLines.length,
      maxSurroundingLines
    );

    // Expand the range and create the prompt content, only if maxSurroundingLines is defined
    if (!maxSurroundingLines) {
      ({ start, end } = expandRange(start, end, contentLines, remainingSpace));
    }
    const promptContent = createPromptContent(
      start,
      end,
      changedIndices,
      contentLines
    );

    result.push({
      fileName: file.fileName,
      promptContent: promptContent,
    });

    return result;
  }, []);
};
