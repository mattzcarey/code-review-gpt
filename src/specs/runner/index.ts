import type { GenerateTextResult, LanguageModelV1 } from 'ai'
import { createModel } from '../../common/llm'
import { getAllTools } from '../../common/llm/tools'
import { getPlatformProvider } from '../../common/platform/factory'
import type { ReviewFile } from '../../common/types'
import { logger } from '../../common/utils/logger'
import { reviewAgent } from '../../review/agent/generate'
import { constructPrompt } from '../../review/prompt'
import type { TestResult, TestScenario, ToolCallInfo } from '../scenarios/types'

export class ScenarioRunner {
  private model: LanguageModelV1
  private maxSteps: number

  constructor(modelString = 'openai:gpt-4o-mini', maxSteps = 25) {
    this.model = createModel(modelString)
    this.maxSteps = maxSteps
  }

  async runScenario(scenario: TestScenario): Promise<TestResult> {
    logger.info(`Running scenario: ${scenario.name}`)

    const reviewFiles: ReviewFile[] = scenario.input.files.map((file) => ({
      fileName: file.fileName,
      fileContent: file.content,
      changedLines: (file.changedLines || []).map((line) => ({ start: line, end: line })),
    }))

    const prompt = await constructPrompt(
      reviewFiles,
      'English',
      scenario.input.customInstructions
    )

    const platformProvider = await getPlatformProvider('local')
    const tools = await getAllTools({
      platformProvider,
      model: this.model,
      includeSubAgent: true,
      maxSteps: this.maxSteps,
    })

    // biome-ignore lint/suspicious/noExplicitAny: Testing utility needs flexible types
    let result: GenerateTextResult<Record<string, any>, string>
    let summarySubmitted = false

    try {
      result = await reviewAgent(prompt, this.model, this.maxSteps, tools, () => {
        summarySubmitted = true
      })
    } catch (error) {
      return {
        passed: false,
        errors: [
          `Agent execution failed: ${error instanceof Error ? error.message : String(error)}`,
        ],
        toolCalls: [],
        summary: '',
      }
    }

    const toolCalls: ToolCallInfo[] =
      result.toolResults?.map((call) => ({
        toolName: call.toolName,
        args: call.args,
        result: call.result,
      })) || []

    const summary = result.text || ''
    const errors: string[] = []

    errors.push(...this.validateToolCalls(toolCalls, scenario.expectations))
    errors.push(...this.validateSummary(summary, scenario.expectations))

    if (!summarySubmitted) {
      errors.push('Agent did not submit summary via submit_summary tool')
    }

    return {
      passed: errors.length === 0,
      errors,
      toolCalls,
      summary,
    }
  }

  public validateToolCalls(
    toolCalls: ToolCallInfo[],
    expectations: TestScenario['expectations']
  ): string[] {
    const errors: string[] = []
    const toolCallCounts = new Map<string, number>()

    for (const call of toolCalls) {
      toolCallCounts.set(call.toolName, (toolCallCounts.get(call.toolName) || 0) + 1)
    }

    for (const expectedTool of expectations.shouldCallTools) {
      if (!toolCallCounts.has(expectedTool)) {
        errors.push(`Expected tool '${expectedTool}' was not called`)
      }
    }

    if (expectations.shouldNotCallTools) {
      for (const forbiddenTool of expectations.shouldNotCallTools) {
        if (toolCallCounts.has(forbiddenTool)) {
          errors.push(
            `Tool '${forbiddenTool}' should not have been called but was called ${toolCallCounts.get(forbiddenTool)} times`
          )
        }
      }
    }

    if (expectations.toolCallValidation) {
      for (const validation of expectations.toolCallValidation) {
        const actualCalls = toolCallCounts.get(validation.toolName) || 0

        if (actualCalls !== validation.expectedCalls) {
          errors.push(
            `Tool '${validation.toolName}' was called ${actualCalls} times, expected ${validation.expectedCalls}`
          )
        }

        if (validation.validateArgs && actualCalls > 0) {
          const relevantCalls = toolCalls.filter(
            (call) => call.toolName === validation.toolName
          )
          for (const call of relevantCalls) {
            const validationResult = validation.validateArgs(call.args)
            if (validationResult !== true) {
              errors.push(
                `Tool '${validation.toolName}' validation failed: ${validationResult}`
              )
            }
          }
        }
      }
    }

    return errors
  }

  public validateSummary(
    summary: string,
    expectations: TestScenario['expectations']
  ): string[] {
    const errors: string[] = []
    const lowerSummary = summary.toLowerCase()

    if (expectations.summaryContains) {
      for (const expectedText of expectations.summaryContains) {
        if (!lowerSummary.includes(expectedText.toLowerCase())) {
          errors.push(`Summary should contain '${expectedText}' but doesn't`)
        }
      }
    }

    if (expectations.summaryDoesNotContain) {
      for (const forbiddenText of expectations.summaryDoesNotContain) {
        if (lowerSummary.includes(forbiddenText.toLowerCase())) {
          errors.push(`Summary should not contain '${forbiddenText}' but does`)
        }
      }
    }

    return errors
  }
}
