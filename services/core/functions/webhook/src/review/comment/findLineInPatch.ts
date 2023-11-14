import { ReviewFile } from "../../types";

export const findPositionsFromSnippet = (
  review: ReviewFile
): { firstLine: number | undefined; lastLine: number } => {
  if (!review.patch) {
    throw Error(`No patch found for file`);
  }
  const lines = review.patch.split("\n");
  const snippetLines = review.codeSnippet.split("\n");

  //trim trailing '...' from the end of each snippet line
  for (let i = 0; i < snippetLines.length; i++) {
    snippetLines[i] = snippetLines[i].replace(/\.\.\.$/, "");
  }

  // Found the first line of the snippet
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(snippetLines[0].trim())) {
      // If the snippet is only one line, return the first line
      if (snippetLines.length === 1) {
        return { firstLine: undefined, lastLine: i };
      }
      // If the snippet is more than one line, check if the next line is the second line of the snippet
      if (i + 1 > lines.length && lines[i + 1].includes(snippetLines[1].trim())) {
        return { firstLine: i, lastLine: i + snippetLines.length - 1 };
      }
      // If the next line is not the second line of the snippet, go to the next line
      continue;
    }
  }

  // Not found, return the last line of the file
  return {
    firstLine: undefined,
    lastLine: lines.length - 1,
  }; // Not found in any file
};
