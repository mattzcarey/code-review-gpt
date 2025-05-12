import { exec } from 'node:child_process'
import { join } from 'node:path'

import {
  getGitHubEnvVariables,
  getGitLabEnvVariables,
  gitAzdevEnvVariables,
} from '../../config'
import { PlatformOptions } from '../types'
import { logger } from '../utils/logger'

export const getDiffCommand = (isCi: string | undefined): string => {
  const diffOptions = '--diff-filter=AMRT -U0'

  if (isCi === PlatformOptions.GITHUB) {
    const { githubSha, baseSha } = getGitHubEnvVariables()
    return `git diff ${diffOptions} ${baseSha} ${githubSha}`
  }

  if (isCi === PlatformOptions.GITLAB) {
    const { gitlabSha, mergeRequestBaseSha } = getGitLabEnvVariables()
    return `git diff ${diffOptions} ${mergeRequestBaseSha} ${gitlabSha}`
  }

  if (isCi === PlatformOptions.AZDEV) {
    const { azdevSha, baseSha } = gitAzdevEnvVariables()
    return `git diff ${diffOptions} ${baseSha} ${azdevSha}`
  }

  if (isCi === PlatformOptions.LOCAL) {
    return `git diff ${diffOptions} --cached`
  }

  throw new Error('Invalid CI platform')
}

export const getGitRoot = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    exec('git rev-parse --show-toplevel', (error, stdout) => {
      if (error) {
        reject(new Error(`Failed to find git root. Error: ${error.message}`))
      } else {
        resolve(stdout.trim())
      }
    })
  })
}

export const getChangedFilesNames = async (
  isCi: string | undefined
): Promise<string[]> => {
  const gitRoot = await getGitRoot()
  logger.debug('gitRoot', gitRoot)
  const nameOnlyCommand = getDiffCommand(isCi).replace('-U0', '--name-only')
  logger.debug('nameOnlyCommand', nameOnlyCommand)
  return new Promise((resolve, reject) => {
    exec(nameOnlyCommand, { cwd: gitRoot }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`Failed to execute command. Error: ${error.message}`))
      } else if (stderr) {
        reject(new Error(`Command execution error: ${stderr}`))
      } else {
        const files = stdout
          .split('\n')
          .filter((fileName) => fileName.trim() !== '')
          .map((fileName) => join(gitRoot, fileName.trim()))
        resolve(files)
      }
    })
  })
}
