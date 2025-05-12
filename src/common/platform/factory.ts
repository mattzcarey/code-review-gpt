import { PlatformOptions } from '../types'
import { logger } from '../utils/logger'
import { githubProvider } from './github/githubProvider'
import { localProvider } from './local/localProvider'
import type { PlatformProvider } from './provider'

export const getPlatformProvider = async (
  providerName: PlatformOptions | string
): Promise<PlatformProvider> => {
  switch (providerName) {
    case PlatformOptions.GITHUB:
      logger.info('Using GitHub platform provider.')
      return await githubProvider()

    case PlatformOptions.GITLAB:
      logger.info('Using GitLab platform provider.')
      throw new Error('GitLab CI provider is not implemented yet.')

    case PlatformOptions.AZDEV:
      logger.info('Using Azure DevOps platform provider.')
      throw new Error('Azure DevOps platform provider is not implemented yet.')

    case PlatformOptions.LOCAL:
      logger.info('Using Local platform provider.')
      return await localProvider()

    default:
      throw new Error(`Unsupported CI environment specified: ${providerName}`)
  }
}
