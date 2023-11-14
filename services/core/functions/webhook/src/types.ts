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
  patch?: string | undefined;
  previous_filename?: string | undefined;
}

export interface Commit {
  sha: string;
}
