import { extname } from 'node:path'

import { languageMap } from '../../constants'

export const getLanguageName = (
  fileName: string,
  defaultLanguage = 'Unknown Language'
): string => {
  const extension = extname(fileName)

  return languageMap[extension] || defaultLanguage
}
