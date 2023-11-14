import { ReviewFile } from "../../types";

export const findPositionsFromSnippet = (
  review: ReviewFile
): { firstLine: number; lastLine: number } => {
  if (!review.patch) {
    return { firstLine: -1, lastLine: -1 };
  }
  const lines = review.patch.split("\n");
  const snippetLines = review.codeSnippet.split("\n");

  for (let i = 0; i <= lines.length - snippetLines.length; i++) {
    const { isMatch, lastLine } = checkSnippetMatch(lines, snippetLines, i);
    if (isMatch) {
      // Line numbers are usually 1-indexed, hence adding 1
      return { firstLine: i + 1, lastLine };
    }
  }

  return { firstLine: -1, lastLine: -1 }; // Not found in any file
};

const checkSnippetMatch = (
  lines: string[],
  snippetLines: string[],
  startIndex: number
): { isMatch: boolean; lastLine: number } => {
  for (let j = 1; j < snippetLines.length; j++) {
    if (lines[startIndex + j] !== snippetLines[j]) {
      return { isMatch: false, lastLine: -1 };
    }
  }

  return { isMatch: true, lastLine: startIndex + snippetLines.length };
};
