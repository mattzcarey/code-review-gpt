import type { z } from 'zod';
import type { feedbackSchema, reviewSchema } from '../review/prompt/schemas';
import type { AIModelName } from '../review/constants';

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

export type CIOptions = 'github' | 'gitlab' | 'azdev';

export type ProviderOptions = 'openai' | 'azureai' | 'bedrock' | 'deepseek';

export type ReviewType = 'full' | 'changed' | 'costOptimized';

export type ReviewArgs = {
  [x: string]: unknown;
  ci: CIOptions | undefined;
  setupTarget: CIOptions;
  commentPerFile: boolean;
  model: AIModelName;
  reviewType: ReviewType;
  reviewLanguage: string | undefined;
  org: string | undefined;
  remote: string | undefined;
  provider: ProviderOptions;
  _: (string | number)[];
  $0: string;
};
