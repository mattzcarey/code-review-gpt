import { ReviewFile } from "../../types";

export const findPositionsFromSnippet = (review: ReviewFile): number => {
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
      return i;
    }
  }

  console.error("Could not find position for snippet:", review.codeSnippet);

  return lines.length - 1;
};
