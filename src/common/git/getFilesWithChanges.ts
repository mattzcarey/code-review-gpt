import { exec } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { exit } from 'node:process'

import type { LineRange, ReviewFile } from '../types'
import { logger } from '../utils/logger'
import { getDiffCommand, getGitRoot } from './getChangedFilesNames'

/**
 * Parses the combined output of `git diff -U0` to extract changed line ranges for each file.
 * @param rawDiff - The raw string output from the git diff command.
 * @param gitRoot - The absolute path to the root of the git repository.
 * @returns A Map where keys are full file paths and values are arrays of LineRange objects
 *          containing line numbers from the current/new version of each file.
 */
const parseCombinedDiff = (
  rawDiff: string,
  gitRoot: string
): Map<string, LineRange[]> => {
  const lines = rawDiff.split('\n')
  const fileMap = new Map<string, LineRange[]>()
  let currentFileName: string | null = null
  const diffHeaderRegex = /^diff --git a\/(.+) b\/(.+)$/
  const hunkHeaderRegex = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/

  for (const line of lines) {
    const diffHeaderMatch = line.match(diffHeaderRegex)
    if (diffHeaderMatch) {
      // Use the 'b' path (the current version) and ensure it's a full path relative to workspace root
      currentFileName = join(gitRoot, diffHeaderMatch[2])
      if (!fileMap.has(currentFileName)) {
        fileMap.set(currentFileName, [])
      }
      continue // Move to the next line after processing header
    }

    if (!currentFileName) {
      continue // Skip lines before the first diff header
    }

    const hunkMatch = line.match(hunkHeaderRegex)
    if (hunkMatch) {
      const oldLineCount = hunkMatch[2] ? Number.parseInt(hunkMatch[2], 10) : 1
      const newStartLine = Number.parseInt(hunkMatch[3], 10)
      const newLineCount = hunkMatch[4] ? Number.parseInt(hunkMatch[4], 10) : 1

      // Handle regular changes (additions and modifications)
      if (newLineCount > 0) {
        const endLine = newStartLine + newLineCount - 1
        const ranges = fileMap.get(currentFileName)
        if (ranges) {
          ranges.push({ start: newStartLine, end: endLine })
        }
      }

      // Handle pure deletions (content was removed but nothing was added)
      if (newLineCount === 0 && oldLineCount > 0) {
        const ranges = fileMap.get(currentFileName)
        if (ranges) {
          // For pure deletions, we create a special range with isPureDeletion flag
          // We'll set both start and end to the line number where content was removed (after this line)
          // This allows the deletion to be represented at a specific position in the new file
          ranges.push({
            start: newStartLine,
            end: newStartLine,
            isPureDeletion: true,
          })
        }
      }
    }
  }

  return fileMap
}

/**
 * Retrieves files that have changes based on git diff, along with their content and changed line numbers.
 * Uses a single combined `git diff -U0` call for efficiency.
 * @param isCi - String indicating the CI environment or undefined for local.
 * @returns A Promise resolving to an array of ReviewFile objects.
 */
export const getFilesWithChanges = async (
  isCi: string | undefined
): Promise<ReviewFile[]> => {
  try {
    const gitRoot = await getGitRoot()
    const diffCommand = getDiffCommand(isCi)
    logger.debug('Running combined diff command:', diffCommand)

    const rawCombinedDiff = await new Promise<string>((resolve, reject) => {
      // Consider increasing maxBuffer for very large diffs
      exec(
        diffCommand,
        { cwd: gitRoot, maxBuffer: 1024 * 1024 * 10 }, // 10MB buffer
        (error, stdout, stderr) => {
          if (error) {
            return reject(
              new Error(`Failed to execute git diff. Error: ${error.message}`)
            )
          }
          // stderr might contain non-error messages from git
          if (stderr?.toLowerCase().includes('error')) {
            logger.error('Git diff command stderr error:', stderr)
            // Decide if stderr errors should be fatal
            // return reject(new Error(`Git diff command error: ${stderr}`));
          } else if (stderr) {
            logger.debug('Git diff command stderr info:', stderr)
          }
          resolve(stdout)
        }
      )
    })

    if (!rawCombinedDiff.trim()) {
      logger.warn(
        'No changes found between refs. Ensure changes are staged (if local) or refs are correct (if CI).'
      )
      exit(0)
    }

    const changedLinesMap = parseCombinedDiff(rawCombinedDiff, gitRoot)
    logger.debug('Parsed changed lines map:', changedLinesMap)

    const fileNames = Array.from(changedLinesMap.keys())

    if (fileNames.length === 0) {
      logger.warn('Parsed diff but found no file changes. Check diff command output.')
      exit(0)
    }

    const filesPromises = fileNames.map(async (fileName) => {
      try {
        const fileContent = await readFile(fileName, 'utf8')
        const changedLines = changedLinesMap.get(fileName) || [] // Default to empty array
        return { fileName, fileContent, changedLines }
      } catch (err) {
        logger.error(`Failed to read file content for ${fileName}: ${err}`)
        // Return null to filter out later, or handle differently
        return null
      }
    })

    const filesResults = await Promise.all(filesPromises)

    // Filter out files that failed to read
    const files: ReviewFile[] = filesResults.filter(
      (file): file is ReviewFile => file !== null
    )

    if (files.length === 0 && fileNames.length > 0) {
      logger.warn(
        'All changed files failed to be read. Check file paths and permissions.'
      )
      // Potentially exit or throw depending on desired behavior
    }

    logger.debug('Final ReviewFile objects:', files)
    return files
  } catch (error) {
    logger.error(`Error in getFilesWithChanges: ${(error as Error).message}`)
    throw new Error(`Failed to get files with changes: ${(error as Error).message}`)
  }
}
