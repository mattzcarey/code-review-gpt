import { getFilesWithChanges } from '../common/git/getFilesWithChanges'
import { createModel } from '../common/llm/models'
import { getPlatformProvider } from '../common/platform/factory'
import type { ReviewArgs, ReviewFile } from '../common/types'
import { logger } from '../common/utils/logger'
import { runAgenticReview } from './agent'
import { constructPrompt } from './prompt'
import { filterFiles } from './utils/filterFiles'

export const review = async (yargs: ReviewArgs): Promise<void> => {
  logger.debug('Review started.')
  logger.debug(`Model used: ${yargs.modelString}`)
  logger.debug(`Review language: ${yargs.reviewLanguage}`)
  logger.debug(`Platform: ${yargs.platform}`)
  logger.debug(`Max steps: ${yargs.maxSteps}`)

  if (yargs.baseUrl) {
    logger.debug(`Base URL: ${yargs.baseUrl}`)
  }

  const files: ReviewFile[] = await getFilesWithChanges(yargs.platform)
  logger.debug(`Found ${files.length} changed files.`)
  const filteredFiles = filterFiles(files)
  logger.debug(`Filtered ${filteredFiles.length} files to review.`)

  if (filteredFiles.length === 0) {
    logger.info('No file to review, finishing review now.')
    return
  }
  logger.debug(
    `Files to review after filtering: ${filteredFiles.map((file) => file.fileName)}`
  )

  const platformProvider = await getPlatformProvider(yargs.platform)
  logger.debug('Platform provider:', platformProvider)

  const model = createModel(yargs.modelString, { baseURL: yargs.baseUrl })
  const prompt = await constructPrompt(filteredFiles, yargs.reviewLanguage)
  logger.debug('Prompt:', prompt)

  try {
    const message = await runAgenticReview(
      prompt,
      model,
      platformProvider,
      yargs.maxSteps
    )

    logger.debug('Review response:', message)
    logger.info('Review completed successfully.')
  } catch (error: unknown) {
    logger.error('Review failed with error:', error)
    process.exit(1)
  }
}
