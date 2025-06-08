import type { TestScenario } from './types'

const subAgentScenarios: TestScenario[] = [
  {
    name: 'Complex Analysis Requires Sub-Agent',
    description:
      'Should spawn sub-agent when custom instructions request detailed analysis',
    tags: ['subagent', 'complex'],
    input: {
      files: [
        {
          fileName: 'src/complex-algorithm.ts',
          content: `// Complex algorithmic implementation
export class GraphTraversal {
  private visited: Set<string> = new Set()
  private adjacencyList: Map<string, string[]> = new Map()

  addEdge(from: string, to: string): void {
    if (!this.adjacencyList.has(from)) {
      this.adjacencyList.set(from, [])
    }
    this.adjacencyList.get(from)?.push(to)
  }

  depthFirstSearch(start: string, target: string): string[] | null {
    this.visited.clear()
    const path: string[] = []
    
    if (this.dfsHelper(start, target, path)) {
      return path
    }
    return null
  }

  private dfsHelper(current: string, target: string, path: string[]): boolean {
    path.push(current)
    this.visited.add(current)

    if (current === target) {
      return true
    }

    const neighbors = this.adjacencyList.get(current) || []
    for (const neighbor of neighbors) {
      if (!this.visited.has(neighbor)) {
        if (this.dfsHelper(neighbor, target, path)) {
          return true
        }
      }
    }

    path.pop()
    return false
  }
}`,
          changedLines: [
            1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
            23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38,
          ],
        },
      ],
      customInstructions: `Please use a sub-agent to perform a comprehensive algorithmic analysis of this code. The analysis should include performance characteristics, potential edge cases, memory usage patterns, and suggestions for optimization.`,
    },
    expectations: {
      shouldCallTools: ['spawn_subagent', 'submit_summary'],
      toolCallValidation: [
        {
          toolName: 'spawn_subagent',
          expectedCalls: 1,
          validateArgs: (args: unknown) => {
            const typedArgs = args as { goal?: string }
            const goal = typedArgs.goal?.toLowerCase() || ''
            if (!goal.includes('algorithm') && !goal.includes('analysis')) {
              return 'Sub-agent goal should mention algorithmic analysis'
            }
            if (!goal.includes('performance') && !goal.includes('optimization')) {
              return 'Sub-agent goal should mention performance or optimization'
            }
            return true
          },
        },
      ],
      toolCallOrder: [
        {
          before: 'spawn_subagent',
          after: 'submit_summary',
          description: 'Sub-agent should be spawned before submitting final summary',
        },
      ],
      minimumToolCalls: 2,
      maximumToolCalls: 5,
    },
  },
  {
    name: 'Security Analysis Sub-Agent',
    description: 'Should spawn sub-agent for security-focused analysis when requested',
    tags: ['subagent', 'security'],
    input: {
      files: [
        {
          fileName: 'src/auth.ts',
          content: `import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export class AuthService {
  private readonly saltRounds = 10
  private readonly jwtSecret = process.env.JWT_SECRET || 'fallback-secret'

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds)
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
  }

  generateToken(userId: string): string {
    return jwt.sign({ userId }, this.jwtSecret, { expiresIn: '24h' })
  }

  verifyToken(token: string): { userId: string } | null {
    try {
      return jwt.verify(token, this.jwtSecret) as { userId: string }
    } catch (error) {
      return null
    }
  }
}`,
          changedLines: [
            1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
            23, 24, 25,
          ],
        },
      ],
      customInstructions: `Please use a sub-agent to conduct a thorough security review of this authentication code. Focus on potential vulnerabilities, best practices, and security hardening opportunities.`,
    },
    expectations: {
      shouldCallTools: ['spawn_subagent', 'submit_summary'],
      toolCallValidation: [
        {
          toolName: 'spawn_subagent',
          expectedCalls: 1,
          validateArgs: (args: unknown) => {
            const typedArgs = args as { goal?: string }
            const goal = typedArgs.goal?.toLowerCase() || ''
            if (!goal.includes('security')) {
              return 'Sub-agent goal should mention security'
            }
            if (!goal.includes('authentication') && !goal.includes('auth')) {
              return 'Sub-agent goal should mention authentication'
            }
            return true
          },
        },
      ],
      minimumToolCalls: 2,
    },
  },
  {
    name: 'Simple Code No Sub-Agent',
    description:
      'Should not spawn sub-agent for simple code without specific instructions',
    tags: ['subagent', 'simple'],
    input: {
      files: [
        {
          fileName: 'src/math.ts',
          content: `export function add(a: number, b: number): number {
  return a + b
}

export function subtract(a: number, b: number): number {
  return a - b
}

export function multiply(a: number, b: number): number {
  return a * b
}`,
          changedLines: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        },
      ],
    },
    expectations: {
      shouldCallTools: ['submit_summary'],
      shouldNotCallTools: ['spawn_subagent'],
      minimumToolCalls: 1,
      maximumToolCalls: 2,
    },
  },
]

// Export scenarios instead of registering them directly
export { subAgentScenarios }
