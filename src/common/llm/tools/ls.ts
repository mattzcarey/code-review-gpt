import fs from 'node:fs/promises'
import path from 'node:path'
import { tool } from 'ai'
import { z } from 'zod'

export const lsTool = tool({
  description:
    'List files and directories at a specified path. Helpful for exploring the repository structure.',
  parameters: z.object({
    path: z.string().describe('The absolute path to list contents from.').default('.'),
    recursive: z
      .boolean()
      .describe('Whether to list contents recursively')
      .default(false),
    includeHidden: z
      .boolean()
      .describe('Whether to include hidden files (starting with .)')
      .default(false),
  }),
  execute: async ({ path: dirPath, recursive, includeHidden }) => {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true })

      const filteredEntries = includeHidden
        ? entries
        : entries.filter((entry) => !entry.name.startsWith('.'))

      const output: string[] = []

      for (const entry of filteredEntries) {
        const entryPath = path.join(dirPath, entry.name)

        if (entry.isDirectory()) {
          output.push(`${entry.name}/`)

          if (recursive) {
            const nestedResult = await listDirectory(entryPath, recursive, includeHidden)

            const indentedSubEntries = nestedResult
              .split('\n')
              .filter((line) => line.trim())
              .map((line) => `  ${line}`)
              .join('\n')

            if (indentedSubEntries) {
              output.push(indentedSubEntries)
            }
          }
        } else {
          output.push(`${entry.name}`)
        }
      }

      return output.join('\n')
    } catch (error) {
      return `Error listing directory: ${error instanceof Error ? error.message : String(error)}`
    }
  },
})

// Helper function to avoid circular reference issues
const listDirectory = async (
  dirPath: string,
  recursive: boolean,
  includeHidden: boolean
): Promise<string> => {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true })

    const filteredEntries = includeHidden
      ? entries
      : entries.filter((entry) => !entry.name.startsWith('.'))

    const output: string[] = []

    for (const entry of filteredEntries) {
      const entryPath = path.join(dirPath, entry.name)

      if (entry.isDirectory()) {
        output.push(`${entry.name}/`)

        if (recursive) {
          const nestedResult = await listDirectory(entryPath, recursive, includeHidden)

          const indentedSubEntries = nestedResult
            .split('\n')
            .filter((line) => line.trim())
            .map((line) => `  ${line}`)
            .join('\n')

          if (indentedSubEntries) {
            output.push(indentedSubEntries)
          }
        }
      } else {
        output.push(`${entry.name}`)
      }
    }

    return output.join('\n')
  } catch (error) {
    return `Error listing directory: ${error instanceof Error ? error.message : String(error)}`
  }
}
