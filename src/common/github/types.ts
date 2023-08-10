export interface PullRequestIdentifier {
  owner: string;
  repo: string;
  prNumber: number;
}

export interface PullRequestFile {
  changeType: string;
  path: string;
}

export interface PullRequest {
  headSha: string;
  files: PullRequestFile[];
}

export interface CommitFile {
  path: string;
  content: string;
}
