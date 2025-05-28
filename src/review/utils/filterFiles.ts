import picomatch from 'picomatch'
import type { ReviewFile } from '../../common/types'
import { defaultIgnoredGlobs } from '../constants'

export const filterFiles = (
  files: ReviewFile[],
  ignoredGlobs?: string[]
): ReviewFile[] => {
  const globs = ignoredGlobs ?? Array.from(defaultIgnoredGlobs)

  if (globs.length === 0) {
    return files
  }

  const isMatch = picomatch(globs)

  return files.filter((file) => {
    return !isMatch(file.fileName)
  })
}
