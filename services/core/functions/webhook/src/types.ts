export interface ChangedFile {
  sha: string;
  filename: string;
  status:
    | "added"
    | "removed"
    | "changed"
    | "renamed"
    | "modified"
    | "copied"
    | "unchanged";
  additions: number;
  deletions: number;
  changes: number;
  blob_url: string;
  raw_url: string;
  contents_url: string;
  patch?: string;
  previous_filename?: string | undefined;
}

export interface Commit {
  sha: string;
}

export interface ReviewFile {
  category: "Bugs" | "Performance" | "Security";
  description: string;
  suggestedCode: string;
  codeSnippet: string;
  filename?: string;
  patch?: string;
}
