import type {
  PlatformProvider,
  ReviewComment,
  ThreadComment,
} from '../../common/platform/provider'
import { PlatformOptions } from '../../common/types'
import type { TokenUsage, ToolCall } from '../../review/types'

interface TestPlatformConfig {
  mockDiffs?: Record<string, string>
  mockFileContents?: Record<string, string>
  repoId?: string
}

export const createTestPlatformProvider = (
  config: TestPlatformConfig = {}
): PlatformProvider => {
  const reviewComments: ReviewComment[] = []
  const threadComments: ThreadComment[] = []
  const usageData: Array<{ tokenUsage: TokenUsage; toolUsage: ToolCall[] }> = []

  return {
    postReviewComment: async (commentDetails: ReviewComment): Promise<string> => {
      reviewComments.push(commentDetails)
      return `test-comment-${reviewComments.length}`
    },

    postThreadComment: async (commentDetails: ThreadComment): Promise<string> => {
      threadComments.push(commentDetails)
      return `test-thread-comment-${threadComments.length}`
    },

    getPlatformOption: (): PlatformOptions => PlatformOptions.LOCAL,

    submitUsage: async (tokenUsage: TokenUsage, toolUsage: ToolCall[]): Promise<void> => {
      usageData.push({ tokenUsage, toolUsage })
    },

    getRepoId: (): string => config.repoId || 'test-repo-id-12345678901234567890',
  }
}

export const createTestPlatformProviderWithData = (scenarioData: {
  files: Array<{ fileName: string; content: string; diff?: string }>
}): PlatformProvider => {
  const mockDiffs: Record<string, string> = {}
  const mockFileContents: Record<string, string> = {}

  for (const file of scenarioData.files) {
    mockFileContents[file.fileName] = file.content
    mockDiffs[file.fileName] = file.diff || 'No changes detected'
  }

  return createTestPlatformProvider({ mockDiffs, mockFileContents })
}
