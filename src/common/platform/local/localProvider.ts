import * as fs from 'node:fs/promises'
import * as os from 'node:os'
import * as path from 'node:path'
import type { TokenUsage, ToolCall } from '../../../review/types'
import { formatSummary } from '../../formatting/summary'
import { formatUsage } from '../../formatting/usage'
import { getGitRoot } from '../../git/getChangedFilesNames'
import { PlatformOptions } from '../../types'
import { logger } from '../../utils/logger'
import type { PlatformProvider, ReviewComment, ThreadComment } from '../provider'

const SHIPPIE_DIR_NAME = '.shippie'

// Helper function to get timestamp string
const getTimestamp = (): string => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0') // Months are 0-indexed
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  return `${year}${month}${day}_${hours}${minutes}${seconds}`
}

export const localProvider = async (): Promise<PlatformProvider> => {
  // Get workspace root dynamically
  const workspaceRoot = await getGitRoot()

  // Generate dynamic filename and path within the factory function
  const timestamp = getTimestamp()
  const reviewFileName = `local_review_${timestamp}.md`
  const reviewFilePath = path.join(workspaceRoot, SHIPPIE_DIR_NAME, reviewFileName)
  const shippieDirPath = path.dirname(reviewFilePath)
  const gitignorePath = path.join(shippieDirPath, '.gitignore')

  // Define helper functions inside the factory to close over reviewFilePath
  const ensureShippieDirExists = async (): Promise<void> => {
    try {
      await fs.mkdir(shippieDirPath, { recursive: true })
      // Create .gitignore if it doesn't exist
      try {
        await fs.access(gitignorePath)
      } catch {
        // File doesn't exist, create it
        await fs.writeFile(gitignorePath, '*')
        logger.debug(`Created .gitignore file at ${gitignorePath}`)
      }
    } catch (error: unknown) {
      // Ignore EEXIST error (directory already exists)
      if ((error as NodeJS.ErrnoException)?.code !== 'EEXIST') {
        logger.error(`Failed to create .shippie directory at ${shippieDirPath}: ${error}`)
        throw error // Re-throw other errors
      }
      // Even if directory existed, ensure .gitignore is present
      try {
        await fs.access(gitignorePath)
      } catch {
        // File doesn't exist, create it
        await fs.writeFile(gitignorePath, '*')
        logger.debug(`Created .gitignore file at ${gitignorePath}`)
      }
    }
  }

  const appendToFile = async (content: string): Promise<void> => {
    logger.debug('appendToFile', content)
    await ensureShippieDirExists() // Uses the enclosed shippieDirPath and gitignorePath
    try {
      await fs.appendFile(reviewFilePath, content + os.EOL) // Uses the enclosed reviewFilePath
    } catch (error) {
      logger.error(`Failed to append to local review file ${reviewFilePath}: ${error}`)
      throw error
    }
  }

  // Return the provider object
  const provider = {
    postReviewComment: async (commentDetails: ReviewComment): Promise<string> => {
      logger.info(
        `LocalProvider: Adding review comment for ${commentDetails.filePath} to ${reviewFilePath}`
      )
      await appendToFile(`${commentDetails.comment}\n`)
      return `Suggestion added to local review file: ${reviewFilePath}`
    },

    postThreadComment: async (commentDetails: ThreadComment): Promise<string> => {
      logger.info(`Local Provider: Adding general thread comment to ${reviewFilePath}.`)
      const formattedComment = formatSummary(commentDetails.comment)
      await appendToFile(`${formattedComment}\n`)
      return `General comment added to local review file: ${reviewFilePath}`
    },

    getPlatformOption: (): PlatformOptions => {
      return PlatformOptions.LOCAL
    },

    submitUsage: async (tokenUsage: TokenUsage, toolUsage: ToolCall[]): Promise<void> => {
      logger.info('Local Provider: Adding usage information to review file.')

      try {
        // Format the usage data with just the current run stats
        const usageSection = `${formatUsage(tokenUsage, toolUsage)}\n`
        await appendToFile(usageSection)

        logger.info(`Usage data added to local review file: ${reviewFilePath}`)
      } catch (error) {
        logger.error(`Failed to add usage data to local review file: ${error}`)
      }
    },
  }

  return provider
}
