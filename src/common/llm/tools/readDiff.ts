import { exec } from 'node:child_process'
import { tool } from 'ai'
import { z } from 'zod'
import { getDiffCommand } from '../../git/getChangedFilesNames'
import type { PlatformProvider } from '../../platform/provider'
import { logger } from '../../utils/logger'

export const createReadDiffTool = (platformProvider: PlatformProvider) =>
  tool({
    description:
      'Generate a diff for a file. This tool shows changes made to a file which should be reviewed. Use in conjunction with read_file to read the current state of a file.',
    parameters: z.object({
      path: z.string().describe('The absolute path to the file to generate a diff for'),
    }),
    execute: async ({ path }) => {
      try {
        const platformOption = platformProvider.getPlatformOption()
        const diffCommandBase = getDiffCommand(platformOption)
        const diffCommand = `${diffCommandBase} -- "${path}"`

        return await new Promise<string>((resolve, reject) => {
          // Use exec like other git commands in the codebase
          exec(diffCommand, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
            if (error && error.code !== 0 && error.code !== 1) {
              // Git diff can exit with code 1 when there are differences
              logger.error(`Git diff error: ${error.message}`)
              return reject(error)
            }

            if (stderr) {
              logger.warn(`Git diff stderr: ${stderr}`)
            }

            resolve(stdout || 'No changes detected')
          })
        })
      } catch (error) {
        logger.error(`Failed to generate diff: ${error}`)
        return `Error generating diff: ${error instanceof Error ? error.message : String(error)}`
      }
    },
  })
