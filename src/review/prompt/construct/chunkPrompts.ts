import type { PromptFile, ReviewFile } from '../../../common/types';
import { logger } from '../../../common/utils/logger';

// --- Types ---
// Simplified: No need for detailed DiffLine/DiffHunk parsing if we skip large hunks
type SimpleHunk = {
  header: string;
  lines: string[]; // Raw lines including header
  totalLength: number;
};

// --- Diff Parsing (Simplified) ---
const parseDiffToSimpleHunks = (rawDiff: string): SimpleHunk[] => {
  const lines = rawDiff.split('\n');
  const hunks: SimpleHunk[] = [];
  let currentHunkLines: string[] = [];
  let currentHunkLength = 0;

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
      // Finalize previous hunk if exists
      if (currentHunkLines.length > 0) {
        const header = currentHunkLines.find((l) => l.startsWith('@@')) || '';
        hunks.push({
          header: header,
          lines: currentHunkLines,
          totalLength: currentHunkLength,
        });
      }
      // Start new hunk
      currentHunkLines = [line];
      currentHunkLength = calculateLineLength(line);
    } else if (currentHunkLines.length > 0) {
      // Ensure we are inside a hunk
      // Add line to current hunk
      currentHunkLines.push(line);
      currentHunkLength += calculateLineLength(line);
    }
  }

  // Add the last hunk
  if (currentHunkLines.length > 0) {
    const header = currentHunkLines.find((l) => l.startsWith('@@')) || '';
    // Check if the hunk contains actual changes, not just context/header
    const hasChanges = currentHunkLines.some((l) => l.startsWith('+') || l.startsWith('-'));
    if (hasChanges) {
      hunks.push({
        header: header,
        lines: currentHunkLines,
        totalLength: currentHunkLength,
      });
    }
  }

  return hunks;
};

// --- Prompt Construction Logic ---

// Calculate length, including newline
const calculateLineLength = (lineContent: string): number => lineContent.length + 1;

export const createPromptFiles = (
  files: ReviewFile[],
  maxPromptPayloadLength: number
): PromptFile[] => {
  const promptFiles: PromptFile[] = [];

  for (const file of files) {
    if (!file.rawDiff || file.rawDiff.trim() === '') {
      continue;
    }

    const hunks = parseDiffToSimpleHunks(file.rawDiff);
    if (hunks.length === 0) {
      continue; // Skip files with no valid hunks or no changes
    }

    // Reserve space for filename, potentially adding " (part N)" later
    // Estimate initial reserve, refine later if chunking
    const baseFileNameReserveLength = calculateLineLength(file.fileName);
    // Rough estimate for " (part N)" suffix
    const partSuffixReserve = 10;

    const fileChunks: { contentLines: string[] }[] = [];
    let currentChunkLines: string[] = [];
    let currentChunkLength = 0;

    for (const hunk of hunks) {
      // Check if the hunk *itself* is too large for a chunk
      // We need to account for the filename reserve for the chunk it would go into
      const potentialFileNameReserve = baseFileNameReserveLength + partSuffixReserve; // Use estimate here
      const maxChunkContentLengthForHunk = maxPromptPayloadLength - potentialFileNameReserve;

      if (hunk.totalLength > maxChunkContentLengthForHunk) {
        logger.warn(
          `Hunk in ${file.fileName} starting near ${hunk.header.split('@@')[1]} is too large (${hunk.totalLength} > ${maxChunkContentLengthForHunk}) and will be skipped.`
        );
        continue; // Skip this large hunk
      }

      // Check if adding this hunk fits in the current chunk
      // Recalculate max content length for *this specific potential chunk*
      const currentChunkNameEstimate =
        file.fileName +
        (fileChunks.length > 0 || currentChunkLines.length > 0
          ? ` (part ${fileChunks.length + 1})`
          : '');
      const currentChunkFileNameReserve = calculateLineLength(currentChunkNameEstimate);
      const maxContentLengthForCurrentChunk = maxPromptPayloadLength - currentChunkFileNameReserve;

      if (currentChunkLength + hunk.totalLength <= maxContentLengthForCurrentChunk) {
        // Fits in the current chunk
        currentChunkLines.push(...hunk.lines);
        currentChunkLength += hunk.totalLength;
      } else {
        // Doesn't fit, finalize the current chunk (if not empty)
        if (currentChunkLines.length > 0) {
          fileChunks.push({ contentLines: currentChunkLines });
        }
        // Start a new chunk with the current hunk
        currentChunkLines = [...hunk.lines];
        currentChunkLength = hunk.totalLength;
      }
    }

    // Add the final remaining chunk if any
    if (currentChunkLines.length > 0) {
      fileChunks.push({ contentLines: currentChunkLines });
    }

    // --- Assign Names and Create PromptFiles ---
    if (fileChunks.length === 0) {
      // This might happen if all hunks were skipped
      logger.warn(`No suitable hunks found for ${file.fileName} within size limits.`);
      continue;
    }
    if (fileChunks.length === 1) {
      const chunk = fileChunks[0];
      // Final check with precise filename length
      const finalChunkName = file.fileName;
      const finalFileNameReserve = calculateLineLength(finalChunkName);
      const chunkContentLength = chunk.contentLines.reduce(
        (sum, line) => sum + calculateLineLength(line),
        0
      );

      if (finalFileNameReserve + chunkContentLength <= maxPromptPayloadLength) {
        promptFiles.push({
          fileName: finalChunkName,
          promptContent: chunk.contentLines.join('\n'),
        });
      } else {
        logger.warn(
          `Single chunk for ${file.fileName} exceeds maxPromptPayloadLength (${finalFileNameReserve + chunkContentLength} > ${maxPromptPayloadLength}) even after filtering. Skipping.`
        );
      }
    } else {
      fileChunks.forEach((chunk, index) => {
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
          // This case might occur if the initial estimation was off, or a chunk is *just* too big with the final name
          logger.warn(
            `Chunk part ${index + 1} for ${file.fileName} exceeds maxPromptPayloadLength (${partNameLength + partContentLength} > ${maxPromptPayloadLength}). Skipping this part.`
          );
        }
      });
    }
  }

  return promptFiles;
};
