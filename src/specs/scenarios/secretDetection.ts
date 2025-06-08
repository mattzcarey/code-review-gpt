import type { TestScenario } from './types'

const secretDetectionScenarios: TestScenario[] = [
  {
    name: 'Exposed API Key Detection',
    description:
      'Should detect exposed API keys and suggest changes with secret-related comments',
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
          changedLines: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        },
      ],
    },
    expectations: {
      shouldCallTools: ['submit_summary'],
      shouldNotCallTools: ['spawn_subagent'],
      summaryContains: ['secret', 'security'],
      minimumToolCalls: 1,
      maximumToolCalls: 5,
    },
  },
  {
    name: 'Environment Variable Hardcoding',
    description:
      'Should detect hardcoded credentials that should use environment variables',
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
          changedLines: [3, 4, 5, 6, 7, 8],
        },
      ],
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
          },
        },
      ],
      summaryContains: ['environment variable'],
      minimumToolCalls: 2,
    },
  },
]

// Export scenarios instead of registering them directly
export { secretDetectionScenarios }
