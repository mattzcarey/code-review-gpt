import type { Scorer as AutoevalsScorer, Score } from 'autoevals';

export type TaskFn<Input = string, Output = string> = (input: Input) => Promise<Output>;

export type TestCase<Input = string, Output = string> = {
  input: Input;
  context?: Output;
  expected: Output;
};

export type FrameworkScorerExtraArgs = {
  model?: string;
};

export type ConfiguredScorer<Input = string, Output = string> = AutoevalsScorer<
  Output,
  FrameworkScorerExtraArgs
>;

export type EvalOptions<Input = string, Output = string> = {
  data: () => Promise<TestCase<Input, Output>[]>;
  task: TaskFn<Input, Output>;
  scorers: ConfiguredScorer<Input, Output>[];
  threshold?: number | null;
  timeout?: number;
  modelString?: string;
};

export type FormattedScore = Score & { name: string };
