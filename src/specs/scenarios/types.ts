export interface TestScenario {
  name: string
  description: string
  input: {
    files: TestFile[]
    customInstructions?: string
  }
  expectations: {
    shouldCallTools: string[]
    shouldNotCallTools?: string[]
    toolCallValidation?: ToolCallValidation[]
    summaryContains?: string[]
    summaryDoesNotContain?: string[]
  }
}

export interface TestFile {
  fileName: string
  content: string
  changedLines?: number[]
}

export interface ToolCallValidation {
  toolName: string
  expectedCalls: number
  validateArgs?: (args: unknown) => boolean | string
}

export interface TestResult {
  passed: boolean
  errors: string[]
  toolCalls: ToolCallInfo[]
  summary: string
}

export interface ToolCallInfo {
  toolName: string
  args: unknown
  result: unknown
}
