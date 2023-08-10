import { ReviewFile } from "../types";
import { CommitFile } from "./types";

type DiffSection = {
  fileName: string;
  content: string;
};

export const associateFilesWithContents = (pullRequestDiff: string, commitFiles: CommitFile[]): ReviewFile[] => {
  const files: ReviewFile[] = [];
  const sections = extractDiffSections(pullRequestDiff);

  for (const i in commitFiles) {
    const commitFile = commitFiles[i];
    const fileName = commitFile.path;
    const fileContent = commitFile.content;
    const changedLines = extractChangedLines(sections, fileName);
    const file = {fileName, fileContent, changedLines};

    files.push(file);
  }

  return files;
}

const extractChangedLines = (sections: DiffSection[], fileName: string): string => {
  for (const section of sections) {
    if (section.fileName === fileName) {
      return section.content;
    }
  }

  return "";
}

const extractDiffSections = (diff: string): DiffSection[] => {
  const sections: DiffSection[] = [];
  const lines = diff.split("\n");

  let currentSection: DiffSection | null = null;

  for (const line of lines) {
    const match = line.match(/diff --git a\/(.+) b\/(.+)/);
    if (match) {
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = {
        fileName: match[2],
        content: "",
      };
    } else if (currentSection && (line.startsWith("+") || line.startsWith("-"))) {
      currentSection.content += line + "\n";
    }
  }
  if (currentSection) {
    sections.push(currentSection);
  }

  return sections;
}
