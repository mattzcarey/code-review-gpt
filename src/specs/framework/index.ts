import { describe, expect, test } from 'bun:test';
import { logger } from '../../common/utils/logger';
import type { EvalOptions, FormattedScore, TestCase } from './types';

// Utility function similar to vitest-evals, adjusted for potentially different scorer outputs
export function wrapText(text: string, width = 80): string {
  if (!text || text.length <= width) {
    return text;
  }
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';
  for (const word of words) {
    if (currentLine.length + word.length + 1 > width) {
      lines.push(currentLine.trim());
      currentLine = word;
    } else {
      currentLine += (currentLine ? ' ' : '') + word;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines.join('\n');
}

export function formatScores(scores: FormattedScore[]): string {
  return scores
    .sort((a, b) => (a.score ?? 0) - (b.score ?? 0))
    .map((s) => {
      const scoreLine = `${s.name || 'Unknown'} [${(s.score ?? 0).toFixed(1)}]`;
      const rationale =
        typeof s.metadata?.rationale === 'string'
          ? `\n  Rationale: ${wrapText(s.metadata.rationale)}`
          : '';
      const output =
        typeof s.metadata?.output === 'string' ? `\n  Output: ${wrapText(s.metadata.output)}` : '';
      return `${scoreLine}${rationale}${output}`;
    })
    .join('\n\n');
}

/**
 * Creates a test suite for evaluating language model outputs using bun:test.
 */
export function describeEval<Input = string, Output = string>(
  name: string,
  {
    data,
    task,
    scorers,
    threshold = 1.0, // Default threshold for average score across scorers
    timeout = 10000, // Default timeout per test case
    modelString = 'openai:gpt-4.1-mini',
  }: EvalOptions<Input, Output>
): void {
  describe(name, async () => {
    const modelProvider = modelString.split(':')[0];
    if (modelProvider !== 'openai') {
      throw new Error(`Unsupported model provider: ${modelProvider}`);
    }
    const modelName = modelString.split(':')[1];

    let testCases: TestCase<Input, Output>[];
    try {
      testCases = await data();
    } catch (error) {
      console.error(`Failed to load data for suite "${name}":`, error);
      // Register a failing test to make the suite failure visible
      test(`Data loading failed for suite "${name}"`, () => {
        throw new Error(
          `Data loading failed: ${error instanceof Error ? error.message : String(error)}`
        );
      });
      return; // Stop processing this suite
    }

    for (const { input, expected } of testCases) {
      test(
        // Use input or a truncated version as test name
        typeof input === 'string' && input.length > 100
          ? `${input.substring(0, 97)}...`
          : String(input),
        async () => {
          const output = await task(input);

          const scoreResults = await Promise.all(
            scorers.map(async (scorer) => {
              const scorerName = scorer.name || 'anonymous_scorer';
              try {
                // Prepare the full arguments object for the scorer
                const scorerArgs = {
                  output, // Standard arg
                  context: expected, // Standard arg (Output type)
                  input, // Extra arg
                  model: modelName,
                };
                // Call directly, relying on ConfiguredScorer type
                let result = await scorer(scorerArgs);

                if (result instanceof Promise) {
                  result = await result;
                }
                return { ...result, name: scorerName };
              } catch (error) {
                console.error(`Scorer "${scorerName}" failed for input: ${String(input)}`, error);
                // Return a failing score if scorer throws
                return {
                  score: 0,
                  name: scorerName,
                  metadata: {
                    rationale: `Scorer failed: ${error instanceof Error ? error.message : String(error)}`,
                  },
                };
              }
            })
          );

          const validScores = scoreResults.filter((s) => s.score !== null) as FormattedScore[];
          const avgScore =
            validScores.length > 0
              ? validScores.reduce((acc, s) => acc + (s.score ?? 0), 0) / validScores.length
              : 0;

          logger.info(`Average score: ${avgScore.toFixed(2)}`);
          logger.info(`Threshold: ${threshold}`);
          logger.info(
            `Metadata:\n${wrapText(String(scoreResults.map((s) => JSON.stringify(s.metadata, null, 6)).join('\n')))}`
          );

          if (threshold !== null) {
            try {
              expect(avgScore >= threshold).toBe(true);
            } catch (error) {
              const detailedMessage =
                `Average Score: ${avgScore.toFixed(2)} below threshold: ${threshold}\n` +
                `Output:\n${wrapText(String(output))}\n\n` +
                `Metadata:\n${wrapText(String(scoreResults.map((s) => JSON.stringify(s.metadata, null, 6)).join('\n')))}\n\n` +
                `Individual Scores:\n${formatScores(validScores)}`;
              throw new Error(detailedMessage);
            }
          } else {
            // If no threshold, just log scores (or potentially pass if all scorers run without error)
            // For now, we won't assert anything based on average score if threshold is null
            // but we might want to log the scores for visibility
            logger.warn(
              `Test case: ${String(input)}\nOutput:\n${wrapText(String(output))}\nScores:\n${formatScores(validScores)}`
            ); // Use String()
          }
        },
        timeout
      );
    }
  });
}
