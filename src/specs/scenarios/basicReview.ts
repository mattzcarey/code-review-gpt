import type { TestScenario } from './types'

const basicReviewScenarios: TestScenario[] = [
  {
    name: 'Code Quality Issues',
    description: 'Should suggest changes for basic code quality issues',
    tags: ['quality', 'basic'],
    input: {
      files: [
        {
          fileName: 'src/bad-code.ts',
          content: `function processData(data) {
  var result = []
  for (var i = 0; i < data.length; i++) {
    if (data[i] != null) {
      if (data[i].type == 'user') {
        result.push(data[i])
      }
    }
  }
  return result
}

async function fetchUserData() {
  const response = fetch('/api/users')
  const data = response.json()
  return data
}`,
          changedLines: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
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
            if (!typedArgs.filePath?.includes('bad-code.ts')) {
              return 'Should target bad-code.ts file'
            }
            const comment = typedArgs.comment?.toLowerCase() || ''
            if (
              !comment.includes('await') &&
              !comment.includes('async') &&
              !comment.includes('const') &&
              !comment.includes('===')
            ) {
              return 'Comment should address async/await or variable declaration issues'
            }
            return true
          },
        },
      ],
      minimumToolCalls: 2,
      maximumToolCalls: 4,
    },
  },
  {
    name: 'TypeScript Type Issues',
    description: 'Should detect and suggest fixes for TypeScript type issues',
    tags: ['typescript', 'types'],
    input: {
      files: [
        {
          fileName: 'src/types.ts',
          content: `interface User {
  id: number
  name: string
  email: string
}

function createUser(data: any): User {
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    age: data.age  // This property doesn't exist on User interface
  }
}

function processUsers(users: any[]): void {
  users.forEach(user => {
    console.log(user.nonExistentProperty)
  })
}`,
          changedLines: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
        },
      ],
    },
    expectations: {
      shouldCallTools: ['suggest_change', 'submit_summary'],
      shouldNotCallTools: ['spawn_subagent'],
      summaryContains: ['type', 'interface'],
      minimumToolCalls: 2,
    },
  },
  {
    name: 'Performance Concerns',
    description: 'Should identify and suggest improvements for performance issues',
    tags: ['performance', 'optimization'],
    input: {
      files: [
        {
          fileName: 'src/performance.ts',
          content: `export function inefficientSort(arr: number[]): number[] {
  // Bubble sort - very inefficient for large arrays
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        const temp = arr[j]
        arr[j] = arr[j + 1]
        arr[j + 1] = temp
      }
    }
  }
  return arr
}

export function searchArray(arr: string[], target: string): boolean {
  // Linear search on potentially sorted array
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) {
      return true
    }
  }
  return false
}`,
          changedLines: [
            1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
          ],
        },
      ],
    },
    expectations: {
      shouldCallTools: ['submit_summary'],
      shouldNotCallTools: ['spawn_subagent'],
      minimumToolCalls: 1,
    },
  },
]

// Export scenarios instead of registering them directly
export { basicReviewScenarios }
