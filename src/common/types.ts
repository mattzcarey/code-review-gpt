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
  rawDiff: string;
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
  modelString: string;
  reviewType: 'full' | 'changed' | 'costOptimized';
  reviewLanguage: string;
  reviewMode: 'default' | 'agent';
  diffContext: number;
  remote?: string;
  ci?: PlatformOptions | string | undefined;
};

export type ParsedArgs = ConfigureArgs | ReviewArgs;
