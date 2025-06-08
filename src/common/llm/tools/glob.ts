import path from 'node:path'
import { tool } from 'ai'
import { glob } from 'tinyglobby'
import { z } from 'zod'

export const globTool = tool({
  description:
    'Find files matching glob patterns. Useful for locating files with specific extensions or naming patterns.',
  parameters: z.object({
    patterns: z.array(z.string()).describe('One or more glob patterns to match files'),
    cwd: z
      .string()
      .describe('The directory to search in. Default is the current directory.')
      .default('.'),
    excludePatterns: z
      .array(z.string())
      .describe('Glob patterns to exclude from results')
      .optional(),
    includeHidden: z
      .boolean()
      .describe('Whether to include hidden files (starting with .)')
      .default(false),
    onlyFiles: z
      .boolean()
      .describe('Whether to only include files (not directories)')
      .default(true),
    maxResults: z.number().describe('Maximum number of results to return').default(100),
  }),
  execute: async ({
    patterns,
    cwd,
    excludePatterns,
    includeHidden,
    onlyFiles,
    maxResults,
  }) => {
    try {
      const options = {
        cwd,
        dot: includeHidden,
        onlyFiles,
        ignore: excludePatterns || [],
      }

      // Process each pattern individually and combine results
      const allFiles: string[] = []

      for (const pattern of patterns) {
        const files = await glob(pattern, options)
        allFiles.push(...files)
      }

      // Remove duplicates
      const uniqueFiles = [...new Set(allFiles)]

      const limitedFiles = uniqueFiles.slice(0, maxResults)
      const hasMore = uniqueFiles.length > maxResults

      if (limitedFiles.length === 0) {
        return `No files found matching the patterns: ${patterns.join(', ')}`
      }

      // Group files by directory for better readability
      const filesByDir: Record<string, string[]> = {}

      for (const file of limitedFiles) {
        const dir = path.dirname(file)
        if (!filesByDir[dir]) {
          filesByDir[dir] = []
        }
        filesByDir[dir].push(path.basename(file))
      }

      const output: string[] = []

      for (const [dir, files] of Object.entries(filesByDir)) {
        if (dir === '.') {
          output.push(`./ (${files.length} files):`)
        } else {
          output.push(`${dir}/ (${files.length} files):`)
        }

        for (const file of files) {
          output.push(`  ${file}`)
        }

        output.push('')
      }

      if (hasMore) {
        output.push(
          `... and ${uniqueFiles.length - maxResults} more files (limited to ${maxResults} results)`
        )
      }

      return `Found ${uniqueFiles.length} files matching the patterns: ${patterns.join(', ')}\n\n${output.join('\n')}`
    } catch (error) {
      return `Error finding files: ${error instanceof Error ? error.message : String(error)}`
    }
  },
})
