import { type GenerateTextResult, type LanguageModelV1, generateText } from 'ai'
import {
  bashTool,
  createReadDiffTool,
  createSubmitSummaryTool,
  createSuggestChangesTool,
  fetchTool,
  globTool,
  grepTool,
  lsTool,
  readFileTool,
} from '../../common/llm/tools'
import type { PlatformProvider } from '../../common/platform/provider'
import { logger } from '../../common/utils/logger'
export const reviewAgent = async (
  prompt: string,
  model: LanguageModelV1,
  platformProvider: PlatformProvider,
  maxSteps: number,
  onSummarySubmit?: () => void
  // biome-ignore lint/suspicious/noExplicitAny: fine
): Promise<GenerateTextResult<Record<string, any>, string>> => {
  const tools = {
    read_file: readFileTool,
    read_diff: createReadDiffTool(platformProvider),
    suggest_change: createSuggestChangesTool(platformProvider),
    submit_summary: createSubmitSummaryTool(platformProvider),
    fetch: fetchTool,
    glob: globTool,
    grep: grepTool,
    ls: lsTool,
    bash: bashTool,
  }

  return generateText({
    model,
    prompt,
    tools,
    maxSteps,
    onStepFinish: (step) => {
      logger.debug('Step finished:', step)
      const summaryToolUsed =
        step.toolCalls?.some((tc) => tc.toolName === 'submit_summary') ||
        step.toolResults?.some((tr) => tr.toolName === 'submit_summary')

      if (summaryToolUsed && onSummarySubmit) {
        logger.debug('Detected submit_summary tool usage in step, triggering callback.')
        onSummarySubmit()
      }
    },
  })
}
