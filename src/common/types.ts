import type { z } from 'zod';
import type { feedbackSchema, reviewSchema } from '../review/prompt/schemas';

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
};

export type PromptFile = {
  fileName: string;
  promptContent: string;
};

export type IFeedback = z.infer<typeof feedbackSchema>;
export type IReviews = z.infer<typeof reviewSchema>;

export enum PlatformOptions {
  GITHUB = 'github',
  GITLAB = 'gitlab',
  AZDEV = 'azdev',
}

export enum ReviewModeOptions {
  DEFAULT = 'default',
  AGENT = 'agent',
}

// Base arguments provided by yargs and global options
type BaseArgs = {
  [x: string]: unknown;
  ci?: PlatformOptions | string | undefined; // Allow string initially, will be validated
  debug?: boolean;
  _?: (string | number)[];
  $0?: string;
};

// Arguments for the configure command
export type ConfigureArgs = BaseArgs & {
  setupTarget?: PlatformOptions | string; // Allow string initially
};

// Arguments for the review command
export type ReviewArgs = BaseArgs & {
  commentPerFile?: boolean;
  model: string;
  reviewType: 'full' | 'changed' | 'costOptimized';
  reviewLanguage: string;
  org?: string;
  remote?: string;
  provider: 'openai' | 'azureai' | 'bedrock';
  mode: 'default' | 'agent';
  ci?: PlatformOptions | string | undefined;
};

// Arguments for the test command
export type TestArgs = BaseArgs & {
  model: string;
  reviewType: 'full' | 'changed' | 'costOptimized';
  ci?: PlatformOptions | string | undefined;
};

export type ParsedArgs = ConfigureArgs | ReviewArgs | TestArgs;
