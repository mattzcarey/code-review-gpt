import type { AIUsage } from '../../review/types';

/**
 * Adds two AIUsage objects together
 */
export const addUsage = (a: AIUsage, b: AIUsage): AIUsage => ({
  promptTokens: a.promptTokens + b.promptTokens,
  completionTokens: a.completionTokens + b.completionTokens,
  totalTokens: a.totalTokens + b.totalTokens,
});

/**
 * Extracts previous usage stats from a comment body
 */
const extractPreviousUsage = (commentBody: string): AIUsage | null => {
  const match = commentBody.match(
    /Total \(Accumulated\)\s*\|\s*(\d+(?:,\d+)*)\s*\|\s*(\d+(?:,\d+)*)\s*\|\s*(\d+(?:,\d+)*)/
  );
  if (!match) return null;

  try {
    const promptTokens = Number.parseInt(match[1].replace(/,/g, ''), 10);
    const completionTokens = Number.parseInt(match[2].replace(/,/g, ''), 10);
    const totalTokens = Number.parseInt(match[3].replace(/,/g, ''), 10);

    return Number.isNaN(promptTokens) || Number.isNaN(completionTokens) || Number.isNaN(totalTokens)
      ? null
      : { promptTokens, completionTokens, totalTokens };
  } catch {
    return null;
  }
};

/**
 * Formats the AI usage data into a collapsible markdown section
 * with both current run and accumulated stats.
 */
export const formatUsageStats = (currentUsage: AIUsage, commentBody?: string): string => {
  const previousUsage = commentBody ? extractPreviousUsage(commentBody) : null;

  const accumulatedUsage = previousUsage ? addUsage(currentUsage, previousUsage) : currentUsage;

  return `
<details>
<summary>📊 Usage Stats</summary>

| Usage | Prompt Tokens | Completion Tokens | Total Tokens |
|-------|--------------|------------------|-------------|
| Current Run | ${currentUsage.promptTokens.toLocaleString()} | ${currentUsage.completionTokens.toLocaleString()} | ${currentUsage.totalTokens.toLocaleString()} |
| Total (Accumulated) | ${accumulatedUsage.promptTokens.toLocaleString()} | ${accumulatedUsage.completionTokens.toLocaleString()} | ${accumulatedUsage.totalTokens.toLocaleString()} |

</details>`;
};
