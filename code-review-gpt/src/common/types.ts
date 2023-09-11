export type AskAIResponse = {
  markdownReport: string;
  feedbacks: IFeedback[];
};

export type CreateFileCommentData = {
  feedback: IFeedback;
  signOff: string;
  owner: string;
  repo: string;
  pull_number: number;
  commit_id: string;
};

export type ReviewFile = {
  fileName: string;
  fileContent: string;
  changedLines: string;
}

export type PromptFile = {
  fileName: string;
  promptContent: string;
};

export type IFeedback = {
  fileName: string;
  riskScore: number;
  details: string;
}

export enum PlatformOptions {
  GITHUB = "github",
  GITLAB = "gitlab",
  AZURE = "azure",
}

export type ReviewArgs = {
  [x: string]: unknown;
  ci: string | undefined;
  setupTarget: string;
  commentPerFile: boolean;
  model: string;
  reviewType: string;
  org: string | undefined;
  remote: string | undefined;
  _: (string | number)[];
  $0: string;
}
