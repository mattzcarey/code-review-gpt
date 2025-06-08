import type { TestFile, TestScenario, ToolCallValidation } from '../scenarios/types'

/**
 * Builder pattern for creating test scenarios
 */
export class ScenarioBuilder {
  private scenario: Partial<TestScenario> = {
    expectations: {
      shouldCallTools: [],
    },
  }

  static create(name: string): ScenarioBuilder {
    const builder = new ScenarioBuilder()
    builder.scenario.name = name
    return builder
  }

  description(description: string): ScenarioBuilder {
    this.scenario.description = description
    return this
  }

  tags(...tags: string[]): ScenarioBuilder {
    this.scenario.tags = tags
    return this
  }

  withFile(fileName: string, content: string, changedLines?: number[]): ScenarioBuilder {
    if (!this.scenario.input) {
      this.scenario.input = { files: [] }
    }

    const file: TestFile = {
      fileName,
      content,
      changedLines,
    }

    this.scenario.input.files.push(file)
    return this
  }

  withCustomInstructions(instructions: string): ScenarioBuilder {
    if (!this.scenario.input) {
      this.scenario.input = { files: [] }
    }
    this.scenario.input.customInstructions = instructions
    return this
  }

  shouldCall(...tools: string[]): ScenarioBuilder {
    if (!this.scenario.expectations) {
      this.scenario.expectations = { shouldCallTools: [] }
    }
    this.scenario.expectations.shouldCallTools.push(...tools)
    return this
  }

  shouldNotCall(...tools: string[]): ScenarioBuilder {
    if (!this.scenario.expectations) {
      this.scenario.expectations = { shouldCallTools: [] }
    }
    if (!this.scenario.expectations.shouldNotCallTools) {
      this.scenario.expectations.shouldNotCallTools = []
    }
    this.scenario.expectations.shouldNotCallTools.push(...tools)
    return this
  }

  expectToolCalls(min?: number, max?: number): ScenarioBuilder {
    if (!this.scenario.expectations) {
      this.scenario.expectations = { shouldCallTools: [] }
    }
    if (min !== undefined) {
      this.scenario.expectations.minimumToolCalls = min
    }
    if (max !== undefined) {
      this.scenario.expectations.maximumToolCalls = max
    }
    return this
  }

  summaryContains(...text: string[]): ScenarioBuilder {
    if (!this.scenario.expectations) {
      this.scenario.expectations = { shouldCallTools: [] }
    }
    if (!this.scenario.expectations.summaryContains) {
      this.scenario.expectations.summaryContains = []
    }
    this.scenario.expectations.summaryContains.push(...text)
    return this
  }

  summaryDoesNotContain(...text: string[]): ScenarioBuilder {
    if (!this.scenario.expectations) {
      this.scenario.expectations = { shouldCallTools: [] }
    }
    if (!this.scenario.expectations.summaryDoesNotContain) {
      this.scenario.expectations.summaryDoesNotContain = []
    }
    this.scenario.expectations.summaryDoesNotContain.push(...text)
    return this
  }

  validateTool(
    toolName: string,
    expectedCalls: number,
    validateArgs?: (args: unknown) => boolean | string
  ): ScenarioBuilder {
    if (!this.scenario.expectations) {
      this.scenario.expectations = { shouldCallTools: [] }
    }
    if (!this.scenario.expectations.toolCallValidation) {
      this.scenario.expectations.toolCallValidation = []
    }

    const validation: ToolCallValidation = {
      toolName,
      expectedCalls,
      validateArgs,
    }

    this.scenario.expectations.toolCallValidation.push(validation)
    return this
  }

  toolOrder(before: string, after: string, description?: string): ScenarioBuilder {
    if (!this.scenario.expectations) {
      this.scenario.expectations = { shouldCallTools: [] }
    }
    if (!this.scenario.expectations.toolCallOrder) {
      this.scenario.expectations.toolCallOrder = []
    }

    this.scenario.expectations.toolCallOrder.push({
      before,
      after,
      description,
    })
    return this
  }

  build(): TestScenario {
    if (!this.scenario.name) {
      throw new Error('Scenario name is required')
    }
    if (!this.scenario.description) {
      throw new Error('Scenario description is required')
    }
    if (!this.scenario.input?.files?.length) {
      throw new Error('At least one test file is required')
    }

    return this.scenario as TestScenario
  }
}

/**
 * Common test file content generators
 */
export const TestFiles = {
  /**
   * Creates a file with exposed secrets
   */
  withExposedSecrets: (fileName = 'src/config.ts') => ({
    fileName,
    content: `export const config = {
  apiKey: 'sk-1234567890abcdef1234567890abcdef',
  database: {
    password: 'super_secret_password123',
    connectionString: 'postgresql://user:password@host:5432/db'
  },
  jwtSecret: 'my-jwt-secret-key'
}`,
    changedLines: [1, 2, 3, 4, 5, 6, 7, 8],
  }),

  /**
   * Creates a file with TypeScript errors
   */
  withTypeErrors: (fileName = 'src/types.ts') => ({
    fileName,
    content: `interface User {
  id: number
  name: string
}

function createUser(data: any): User {
  return {
    id: data.id,
    name: data.name,
    invalidProperty: data.invalid  // Property doesn't exist on User
  }
}`,
    changedLines: [5, 6, 7, 8, 9, 10, 11],
  }),

  /**
   * Creates a clean file with no issues
   */
  cleanFile: (fileName = 'src/utils.ts') => ({
    fileName,
    content: `export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/
  return emailRegex.test(email)
}`,
    changedLines: [1, 2, 3, 4, 5, 6, 7, 8],
  }),

  /**
   * Creates a complex file that might benefit from sub-agent analysis
   */
  complexAlgorithm: (fileName = 'src/algorithm.ts') => ({
    fileName,
    content: `export class GraphAlgorithm {
  private visited: Set<string> = new Set()
  private graph: Map<string, string[]> = new Map()

  addEdge(from: string, to: string): void {
    if (!this.graph.has(from)) {
      this.graph.set(from, [])
    }
    this.graph.get(from)?.push(to)
  }

  findShortestPath(start: string, end: string): string[] | null {
    const queue: { node: string; path: string[] }[] = [{ node: start, path: [start] }]
    const visited = new Set<string>()

    while (queue.length > 0) {
      const { node, path } = queue.shift()!
      
      if (node === end) {
        return path
      }

      if (visited.has(node)) {
        continue
      }

      visited.add(node)
      const neighbors = this.graph.get(node) || []
      
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          queue.push({ node: neighbor, path: [...path, neighbor] })
        }
      }
    }

    return null
  }
}`,
    changedLines: Array.from({ length: 33 }, (_, i) => i + 1),
  }),
}

/**
 * Common validation functions
 */
export const Validators = {
  /**
   * Validates that suggest_change targets the correct file and mentions secrets
   */
  secretSuggestion: (expectedFileName: string) => (args: unknown) => {
    const typedArgs = args as { filePath?: string; comment?: string }
    if (!typedArgs.filePath?.includes(expectedFileName)) {
      return `Should target ${expectedFileName}`
    }
    if (!typedArgs.comment?.toLowerCase().includes('secret')) {
      return 'Comment should mention secrets'
    }
    return true
  },

  /**
   * Validates that spawn_subagent has appropriate goal
   */
  subAgentGoal:
    (...requiredTerms: string[]) =>
    (args: unknown) => {
      const typedArgs = args as { goal?: string }
      const goal = typedArgs.goal?.toLowerCase() || ''

      for (const term of requiredTerms) {
        if (!goal.includes(term.toLowerCase())) {
          return `Sub-agent goal should include '${term}'`
        }
      }
      return true
    },

  /**
   * Validates that a comment contains specific terms
   */
  commentContains:
    (...terms: string[]) =>
    (args: unknown) => {
      const typedArgs = args as { comment?: string }
      const comment = typedArgs.comment?.toLowerCase() || ''

      for (const term of terms) {
        if (!comment.includes(term.toLowerCase())) {
          return `Comment should contain '${term}'`
        }
      }
      return true
    },
}
