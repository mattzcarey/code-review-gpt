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

export interface ReviewFile {
  fileName: string;
  fileContent: string;
  changedLines: string;
}

export type PromptFile = {
  fileName: string;
  promptContent: string;
};

export interface IFeedback {
  fileName: string;
  riskScore: number;
  details: string;
}

export enum PlatformOptions {
  GITHUB = "github",
  GITLAB = "gitlab",
}

export interface ReviewArgs {
  [x: string]: unknown;
  ci: string;
  setupTarget: string;
  commentPerFile: boolean;
  model: string;
  reviewType: string;
  _: (string | number)[];
  $0: string;
}
