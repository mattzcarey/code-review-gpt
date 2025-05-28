import { extname } from 'node:path'

import type { ReviewFile } from '../../common/types'
import {excludedKeywords, supportedFiles} from '../constants'

export const filterFiles = (files: ReviewFile[], checkFileTypes: string[]): ReviewFile[] => {
  const filteredFiles = files.filter((file) => {
    const ext = extname(file.fileName)

    // use the default
    let allowedFiles = supportedFiles

    if (checkFileTypes.length > 0) {
      // overwrite with user input
      allowedFiles =  new Set(checkFileTypes)
    }

    return (
        allowedFiles.has(ext) &&
        ![...excludedKeywords].some((keyword) => file.fileName.includes(keyword)) &&
        file.fileName.trim() !== ''
    )
  })

  return filteredFiles
}
