import { describe, expect, test } from 'bun:test'
import type { ToolCallInfo } from '../scenarios/types'
import { ScenarioRunner } from './index'

describe('ScenarioRunner', () => {
  const runner = new ScenarioRunner('openai:gpt-4o-mini', 5)

  describe('validateToolCalls', () => {
    test('should pass when expected tools are called', () => {
      const toolCalls: ToolCallInfo[] = [
        { toolName: 'suggest_change', args: {}, result: {} },
        { toolName: 'submit_summary', args: {}, result: {} },
      ]

      const expectations = {
        shouldCallTools: ['suggest_change', 'submit_summary'],
        shouldNotCallTools: ['spawn_subagent'],
      }

      const errors = runner.validateToolCalls(toolCalls, expectations)
      expect(errors).toEqual([])
    })

    test('should fail when expected tools are not called', () => {
      const toolCalls: ToolCallInfo[] = [
        { toolName: 'submit_summary', args: {}, result: {} },
      ]

      const expectations = {
        shouldCallTools: ['suggest_change', 'submit_summary'],
      }

      const errors = runner.validateToolCalls(toolCalls, expectations)
      expect(errors).toContain("Expected tool 'suggest_change' was not called")
    })

    test('should fail when forbidden tools are called', () => {
      const toolCalls: ToolCallInfo[] = [
        { toolName: 'spawn_subagent', args: {}, result: {} },
      ]

      const expectations = {
        shouldCallTools: [],
        shouldNotCallTools: ['spawn_subagent'],
      }

      const errors = runner.validateToolCalls(toolCalls, expectations)
      expect(errors).toContain(
        "Tool 'spawn_subagent' should not have been called but was called 1 times"
      )
    })

    test('should validate tool call arguments', () => {
      const toolCalls: ToolCallInfo[] = [
        {
          toolName: 'suggest_change',
          args: { filePath: 'src/config.ts', comment: 'Fix secret exposure' },
          result: {},
        },
      ]

      const expectations = {
        shouldCallTools: ['suggest_change'],
        toolCallValidation: [
          {
            toolName: 'suggest_change',
            expectedCalls: 1,
            validateArgs: (args: unknown) => {
              const typedArgs = args as { filePath?: string; comment?: string }
              if (!typedArgs.filePath?.includes('config.ts')) {
                return 'Wrong file targeted'
              }
              if (!typedArgs.comment?.includes('secret')) {
                return 'Comment should mention secrets'
              }
              return true
            },
          },
        ],
      }

      const errors = runner.validateToolCalls(toolCalls, expectations)
      expect(errors).toEqual([])
    })

    test('should fail argument validation', () => {
      const toolCalls: ToolCallInfo[] = [
        {
          toolName: 'suggest_change',
          args: { filePath: 'src/other.ts', comment: 'Some comment' },
          result: {},
        },
      ]

      const expectations = {
        shouldCallTools: ['suggest_change'],
        toolCallValidation: [
          {
            toolName: 'suggest_change',
            expectedCalls: 1,
            validateArgs: (args: unknown) => {
              const typedArgs = args as { filePath?: string; comment?: string }
              if (!typedArgs.filePath?.includes('config.ts')) {
                return 'Wrong file targeted'
              }
              return true
            },
          },
        ],
      }

      const errors = runner.validateToolCalls(toolCalls, expectations)
      expect(errors).toContain(
        "Tool 'suggest_change' validation failed: Wrong file targeted"
      )
    })
  })

  describe('validateSummary', () => {
    test('should pass when summary contains expected text', () => {
      const summary = 'This code has security issues with exposed secrets'
      const expectations = {
        shouldCallTools: [],
        summaryContains: ['security', 'secrets'],
      }

      const errors = runner.validateSummary(summary, expectations)
      expect(errors).toEqual([])
    })

    test('should fail when summary missing expected text', () => {
      const summary = 'This code looks fine'
      const expectations = {
        shouldCallTools: [],
        summaryContains: ['security', 'secrets'],
      }

      const errors = runner.validateSummary(summary, expectations)
      expect(errors).toContain("Summary should contain 'security' but doesn't")
      expect(errors).toContain("Summary should contain 'secrets' but doesn't")
    })

    test('should fail when summary contains forbidden text', () => {
      const summary = 'This code looks good with no issues'
      const expectations = {
        shouldCallTools: [],
        summaryDoesNotContain: ['looks good', 'no issues'],
      }

      const errors = runner.validateSummary(summary, expectations)
      expect(errors).toContain("Summary should not contain 'looks good' but does")
      expect(errors).toContain("Summary should not contain 'no issues' but does")
    })
  })
})
