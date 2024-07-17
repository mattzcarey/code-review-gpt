import { readFile } from "fs/promises"
import { exit } from "process"

import { type ReviewFile } from "../types"
import { logger } from "../utils/logger"
import { getChangedFileLines } from "./getChangedFileLines"
import { getChangedFilesNames } from "./getChangedFilesNames"

export const getFilesWithChanges = async (isCi: string | undefined): Promise<ReviewFile[]> => {
  try {
    const fileNames = await getChangedFilesNames(isCi)

    if (fileNames.length === 0) {
      logger.warn("No files with changes found, you might need to stage your changes.")
      exit(0)
    }

    const files = await Promise.all(
      fileNames.map(async fileName => {
        const fileContent = await readFile(fileName, "utf8")
        const changedLines = await getChangedFileLines(isCi, fileName)
        logger.debug(`Changed lines for file: ${fileName}. Got ${changedLines.length} lines.`)

        return { fileName, fileContent, changedLines }
      })
    )

    logger.debug(`Found ${files.length} files with changes.`)

    return files
  } catch (error) {
    throw new Error(`Failed to get files with changes: ${error}`)
  }
}
