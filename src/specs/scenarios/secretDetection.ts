import { scenarioRegistry } from './index'
import type { TestScenario } from './types'

const secretDetectionScenarios: TestScenario[] = [
  {
    name: 'Exposed API Key Detection',
    description: 'Should detect exposed API keys and suggest changes with secret-related comments',
    tags: ['security', 'secrets'],
    input: {
      files: [
        {
          fileName: 'src/config.ts',
          content: `export const config = {
  apiKey: 'sk-1234567890abcdef1234567890abcdef',
  database: {
    host: 'localhost',
    port: 5432,
    password: 'super_secret_password123'
  },
  jwtSecret: 'my-jwt-secret-key-that-should-not-be-hardcoded'
}`,
          changedLines: [1, 2, 3, 4, 5, 6, 7, 8, 9]
        }
      ]
    },
    expectations: {
      shouldCallTools: ['suggest_change', 'submit_summary'],
      shouldNotCallTools: ['spawn_subagent'],
      toolCallValidation: [
        {
          toolName: 'suggest_change',
          expectedCalls: 1,
          validateArgs: (args: unknown) => {
            const typedArgs = args as { filePath?: string; comment?: string }
            if (!typedArgs.filePath?.includes('config.ts')) {
              return 'Should target config.ts file'
            }
            if (!typedArgs.comment?.toLowerCase().includes('secret')) {
              return 'Comment should mention secrets'
            }
            return true
          }
        }
      ],
      summaryContains: ['secret', 'security'],
      minimumToolCalls: 2,
      maximumToolCalls: 5
    }
  },
  {
    name: 'Environment Variable Hardcoding',
    description: 'Should detect hardcoded credentials that should use environment variables',
    tags: ['security', 'secrets', 'env'],
    input: {
      files: [
        {
          fileName: 'src/database.ts',
          content: `import { Pool } from 'pg'

const pool = new Pool({
  user: 'admin',
  host: 'prod-db.company.com',
  database: 'production',
  password: 'P@ssw0rd123!',
  port: 5432,
})

export default pool`,
          changedLines: [3, 4, 5, 6, 7, 8]
        }
      ]
    },
    expectations: {
      shouldCallTools: ['suggest_change', 'submit_summary'],
      shouldNotCallTools: ['spawn_subagent'],
      toolCallValidation: [
        {
          toolName: 'suggest_change',
          expectedCalls: 1,
          validateArgs: (args: unknown) => {
            const typedArgs = args as { filePath?: string; comment?: string }
            if (!typedArgs.filePath?.includes('database.ts')) {
              return 'Should target database.ts file'
            }
            const comment = typedArgs.comment?.toLowerCase() || ''
            if (!comment.includes('password') && !comment.includes('credential')) {
              return 'Comment should mention password or credentials'
            }
            return true
          }
        }
      ],
      summaryContains: ['credential', 'environment'],
      minimumToolCalls: 2
    }
  },
  {
    name: 'No Secrets Clean File',
    description: 'Should not suggest changes when no secrets are present',
    tags: ['security', 'clean'],
    input: {
      files: [
        {
          fileName: 'src/utils.ts',
          content: `export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/
  return emailRegex.test(email)
}

export const DEFAULT_TIMEOUT = 5000`,
          changedLines: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        }
      ]
    },
    expectations: {
      shouldCallTools: ['submit_summary'],
      shouldNotCallTools: ['suggest_change', 'spawn_subagent'],
      summaryContains: ['no issues', 'looks good'],
      minimumToolCalls: 1,
      maximumToolCalls: 2
    }
  }
]

// Register all secret detection scenarios
for (const scenario of secretDetectionScenarios) {
  scenarioRegistry.register(scenario)
}