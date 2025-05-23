import type { StepResult } from 'ai'
import type { TokenUsage, ToolCall } from '../../review/types'
import { FORMATTING } from './summary'

/**
 * Adds up the usage from a list of steps and adds it to the past usage
 */
export const accumulateTokenUsage = (
  pastUsage: TokenUsage,
  // biome-ignore lint/suspicious/noExplicitAny: fine for StepResult generics
  steps: StepResult<Record<string, any>>[]
): TokenUsage => {
  const totalUsage = steps.reduce((acc, step) => {
    return {
      promptTokens: acc.promptTokens + step.usage.promptTokens,
      completionTokens: acc.completionTokens + step.usage.completionTokens,
      totalTokens: acc.totalTokens + step.usage.totalTokens,
    }
  }, pastUsage)

  return totalUsage
}

/**
 * Add two TokenUsage objects together
 */
export const addTokenUsage = (a: TokenUsage, b: TokenUsage): TokenUsage => ({
  promptTokens: a.promptTokens + b.promptTokens,
  completionTokens: a.completionTokens + b.completionTokens,
  totalTokens: a.totalTokens + b.totalTokens,
})

/**
 * Extracts previous usage stats from a comment body
 */
const extractPreviousTokenUsage = (commentBody: string): TokenUsage | null => {
  const match = commentBody.match(
    /Total for PR\s*\|\s*(\d+(?:,\d+)*)\s*\|\s*(\d+(?:,\d+)*)\s*\|\s*(\d+(?:,\d+)*)/
  )
  if (!match) return null

  try {
    const promptTokens = Number.parseInt(match[1].replace(/,/g, ''), 10)
    const completionTokens = Number.parseInt(match[2].replace(/,/g, ''), 10)
    const totalTokens = Number.parseInt(match[3].replace(/,/g, ''), 10)

    return Number.isNaN(promptTokens) ||
      Number.isNaN(completionTokens) ||
      Number.isNaN(totalTokens)
      ? null
      : { promptTokens, completionTokens, totalTokens }
  } catch {
    return null
  }
}

export const formatUsage = (
  currentUsage: TokenUsage,
  toolUsage: ToolCall[],
  commentBody?: string
): string => {
  const previousTokenUsage = commentBody ? extractPreviousTokenUsage(commentBody) : null

  const accumulatedTokenUsage = previousTokenUsage
    ? addTokenUsage(currentUsage, previousTokenUsage)
    : currentUsage

  return `
<details>
<summary>${FORMATTING.TOOL_CALLS_TITLE}</summary>

${toolUsage
  .map(
    (toolCall) => `
#### \`${toolCall.name}\`

\`\`\`json
${JSON.stringify(toolCall.args, null, 4)}
\`\`\`

<details>
<summary>Result:</summary>

\`\`\`json
${JSON.stringify(toolCall.result, null, 6)}
\`\`\`
</details>
`
  )
  .join('\n')}
</details>

<details>
<summary>${FORMATTING.TOKEN_USAGE_TITLE}</summary>

| Usage | Prompt Tokens | Completion Tokens | Total Tokens |
|-------|--------------|------------------|-------------|
| Current Run | ${currentUsage.promptTokens.toLocaleString()} | ${currentUsage.completionTokens.toLocaleString()} | ${currentUsage.totalTokens.toLocaleString()} |
| Total for PR | ${accumulatedTokenUsage.promptTokens.toLocaleString()} | ${accumulatedTokenUsage.completionTokens.toLocaleString()} | ${accumulatedTokenUsage.totalTokens.toLocaleString()} |

</details>`
}

export const formatToolUsage = (
  pastToolCalls: ToolCall[],
  // biome-ignore lint/suspicious/noExplicitAny: fine for GenerateTextResult generics
  steps: StepResult<Record<string, any>>[],
  retry: number
): ToolCall[] => {
  const toolCalls: ToolCall[] = []

  for (const step of steps) {
    for (const toolCall of step.toolCalls) {
      const toolResult = step.toolResults.find(
        (result) => result.toolCallId === toolCall.toolCallId
      )

      if (toolCall && toolResult) {
        toolCalls.push({
          args: toolCall.args,
          name: toolCall.toolName,
          result: toolResult.result,
          retry: retry,
        })
      }
    }
  }

  return pastToolCalls.concat(toolCalls)
}
