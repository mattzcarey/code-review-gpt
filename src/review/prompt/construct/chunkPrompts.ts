import type { PromptFile, ReviewFile } from '../../../common/types';
import { logger } from '../../../common/utils/logger';

// --- Types ---
type DiffLineType = 'add' | 'delete' | 'context';
type DiffLine = {
  type: DiffLineType;
  content: string; // The line content without the +/-/space prefix
  originalLineNumber?: number; // Line number in the original file (for delete/context)
  newLineNumber?: number; // Line number in the new file (for add/context)
};

type DiffHunk = {
  header: string; // The '@@ ... @@' line
  lines: DiffLine[];
  originalStartLine: number;
  newStartLine: number;
};

// --- Diff Parsing ---
const parseDiffHunkHeader = (
  header: string
): { originalStartLine: number; newStartLine: number } => {
  const match = header.match(/@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
  if (match) {
    return {
      originalStartLine: Number.parseInt(match[1], 10),
      newStartLine: Number.parseInt(match[2], 10),
    };
  }
  return { originalStartLine: 0, newStartLine: 0 }; // Fallback
};

const parseDiff = (rawDiff: string): DiffHunk[] => {
  const lines = rawDiff.split('\n');
  const hunks: DiffHunk[] = [];
  let currentHunk: DiffHunk | null = null;
  let currentOriginalLine = 0;
  let currentNewLine = 0;

  for (const line of lines) {
    if (
      line.startsWith('diff --git') ||
      line.startsWith('index ') ||
      line.startsWith('---') ||
      line.startsWith('+++')
    ) {
      // Skip git headers
      continue;
    }
    if (line.startsWith('@@')) {
      const headerInfo = parseDiffHunkHeader(line);
      currentOriginalLine = headerInfo.originalStartLine;
      currentNewLine = headerInfo.newStartLine;
      currentHunk = {
        header: line,
        lines: [],
        originalStartLine: headerInfo.originalStartLine,
        newStartLine: headerInfo.newStartLine,
      };
      hunks.push(currentHunk);
    } else if (
      currentHunk &&
      (line.startsWith('+') || line.startsWith('-') || line.startsWith(' '))
    ) {
      const content = line.substring(1);
      if (line.startsWith('+')) {
        currentHunk.lines.push({ type: 'add', content, newLineNumber: currentNewLine });
        currentNewLine++;
      } else if (line.startsWith('-')) {
        currentHunk.lines.push({
          type: 'delete',
          content,
          originalLineNumber: currentOriginalLine,
        });
        currentOriginalLine++;
      } else {
        // Starts with ' '
        currentHunk.lines.push({
          type: 'context',
          content,
          originalLineNumber: currentOriginalLine,
          newLineNumber: currentNewLine,
        });
        currentOriginalLine++;
        currentNewLine++;
      }
    }
    // Include other lines like "\\ No newline at end of file"
    else if (currentHunk && line.startsWith('\\')) {
      currentHunk.lines.push({ type: 'context', content: line }); // Treat as context for simplicity
    }
  }
  return hunks;
};

// --- Prompt Construction Logic with Chunking ---

// Helper to format a DiffLine back to its string representation for prompt content
const formatDiffLine = (line: DiffLine): string => {
  switch (line.type) {
    case 'add':
      return `+${line.content}`;
    case 'delete':
      return `-${line.content}`;
    case 'context':
      return ` ${line.content}`;
    default:
      // Should not happen with current parsing, but handle defensively
      return line.content;
  }
};

// Calculate length, including newline
const calculateLineLength = (lineContent: string): number => lineContent.length + 1;

export const createPromptFiles = (
  files: ReviewFile[],
  maxPromptPayloadLength: number,
  // maxSurroundingLines is ignored in this chunking approach
  maxSurroundingLines?: number
): PromptFile[] => {
  const promptFiles: PromptFile[] = [];

  for (const file of files) {
    if (!file.rawDiff || file.rawDiff.trim() === '') {
      continue;
    }

    const hunks = parseDiff(file.rawDiff);
    // Ensure there are actual changes (+/- lines) within the hunks
    const hasChanges = hunks.some((hunk) =>
      hunk.lines.some((line) => line.type === 'add' || line.type === 'delete')
    );
    if (hunks.length === 0 || !hasChanges) {
      continue;
    }

    // Reserve space for filename and potential " (part N)" suffix
    const fileNameReserveLength = calculateLineLength(file.fileName) + 10;
    const maxChunkContentLength = maxPromptPayloadLength - fileNameReserveLength;

    const fileChunks: { contentLines: string[] }[] = []; // Store raw lines for each chunk
    let currentChunkLines: string[] = [];
    let currentChunkLength = 0;

    for (const hunk of hunks) {
      // Format lines for the current hunk and calculate its length
      const hunkLines = [hunk.header, ...hunk.lines.map(formatDiffLine)];
      const hunkLength = hunkLines.reduce((sum, line) => sum + calculateLineLength(line), 0);

      // Skip empty hunks (shouldn't happen with parser, but safety)
      if (hunkLength === 0) continue;

      // Handle oversized hunks: add as separate chunk if too big even on its own
      if (hunkLength > maxChunkContentLength && currentChunkLines.length === 0) {
        logger.warn(
          `Hunk in ${file.fileName} starting at ${hunk.header} exceeds maxPromptPayloadLength. Sending as its own chunk.`
        );
        fileChunks.push({ contentLines: hunkLines });
        currentChunkLines = []; // Reset for next iteration
        currentChunkLength = 0;
        continue;
      }

      // If adding hunk exceeds limit for current chunk, finalize current and start new
      if (currentChunkLength + hunkLength > maxChunkContentLength && currentChunkLines.length > 0) {
        fileChunks.push({ contentLines: currentChunkLines });
        currentChunkLines = hunkLines;
        currentChunkLength = hunkLength;

        // Check if the new chunk *itself* now violates the limit (can happen if maxChunkContentLength is very small)
        if (currentChunkLength > maxChunkContentLength) {
          logger.warn(
            `Single hunk starting ${hunk.header} in ${file.fileName} still exceeds limit after starting new chunk. Sending oversized.`
          );
          // Keep it as is, it will be pushed as its own chunk later.
        }
      } else {
        // Add hunk to current chunk
        currentChunkLines.push(...hunkLines);
        currentChunkLength += hunkLength;
      }
    }

    // Add the last chunk
    if (currentChunkLines.length > 0) {
      fileChunks.push({ contentLines: currentChunkLines });
    }

    // Assign names and add to final results
    if (fileChunks.length === 1) {
      // Only add if the single chunk doesn't exceed the total payload limit
      if (currentChunkLength + fileNameReserveLength <= maxPromptPayloadLength) {
        promptFiles.push({
          fileName: file.fileName,
          promptContent: fileChunks[0].contentLines.join('\n'),
        });
      } else {
        logger.warn(
          `Single chunk for ${file.fileName} exceeds maxPromptPayloadLength even alone. Skipping.`
        );
        // Or potentially send it anyway if desired?
        // promptFiles.push({ fileName: file.fileName, promptContent: fileChunks[0].contentLines.join('\n') });
      }
    } else {
      fileChunks.forEach((chunk, index) => {
        // Double-check length for each part (conservative check)
        const partName = `${file.fileName} (part ${index + 1})`;
        const partNameLength = calculateLineLength(partName);
        const partContentLength = chunk.contentLines.reduce(
          (sum, line) => sum + calculateLineLength(line),
          0
        );

        if (partNameLength + partContentLength <= maxPromptPayloadLength) {
          promptFiles.push({
            fileName: partName,
            promptContent: chunk.contentLines.join('\n'),
          });
        } else {
          logger.warn(
            `Chunk part ${index + 1} for ${file.fileName} exceeds maxPromptPayloadLength. Skipping this part.`
          );
        }
      });
    }
  }

  return promptFiles;
};
