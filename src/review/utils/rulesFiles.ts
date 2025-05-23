import { readFile } from 'node:fs/promises'
import { join, relative } from 'node:path'
import matter from 'gray-matter'
import { glob } from 'tinyglobby'
import { logger } from '../../common/utils/logger'

interface MdcRuleFrontmatter {
  description?: string
  globs?: string[]
  alwaysApply?: boolean
}

interface RuleFile {
  path: string
  type: 'mdc' | 'md'
  frontmatter?: MdcRuleFrontmatter
  description: string
  content: string
}

interface ImportantFile {
  path: string
  content: string
}

const RULES_DIRECTORIES = [
  '.cursor/rules/*.{mdc,md}',
  '.shippie/rules/*.{mdc,md}',
  '.windsurfrules/*.{mdc,md}',
  'clinerules/*.{mdc,md}',
]

const IMPORTANT_FILES = [
  'AGENTS.md',
  'AGENT.md',
  'todo.md',
  'CLAUDE.md',
  '.same/todos.md',
  'CONTRIBUTING.md',
]

const getFirstLinesDescription = (content: string, maxLines = 3): string => {
  const lines = content.split('\n').filter((line) => line.trim())
  return lines.slice(0, maxLines).join(' ').slice(0, 200)
}

const parseGlobs = (globs: unknown): string[] | undefined => {
  if (!globs) return undefined

  if (Array.isArray(globs)) {
    return globs.filter((g) => typeof g === 'string')
  }

  if (typeof globs === 'string') {
    return globs
      .split(',')
      .map((g) => g.trim())
      .filter(Boolean)
  }

  return undefined
}

export const findRulesFiles = async (workspaceRoot: string): Promise<RuleFile[]> => {
  const rulesFiles: RuleFile[] = []

  for (const pattern of RULES_DIRECTORIES) {
    try {
      const files = await glob(pattern, { cwd: workspaceRoot, absolute: false })

      for (const file of files) {
        try {
          const filePath = join(workspaceRoot, file)
          const content = await readFile(filePath, 'utf-8')
          const relativePath = relative(workspaceRoot, filePath)
          const parsed = matter(content)

          const frontmatter: MdcRuleFrontmatter = {
            description: parsed.data.description,
            globs: parseGlobs(parsed.data.globs),
            alwaysApply: parsed.data.alwaysApply,
          }

          const fileType = file.endsWith('.mdc') ? 'mdc' : 'md'
          const description =
            frontmatter.description || getFirstLinesDescription(parsed.content || content)

          rulesFiles.push({
            path: relativePath,
            type: fileType,
            frontmatter: Object.keys(parsed.data).length > 0 ? frontmatter : undefined,
            description,
            content: parsed.content || content,
          })
        } catch (error) {
          logger.debug(`Failed to read rules file ${file}:`, error)
        }
      }
    } catch (error) {
      logger.debug(`Failed to glob pattern ${pattern}:`, error)
    }
  }

  return rulesFiles
}

export const findImportantFiles = async (
  workspaceRoot: string
): Promise<ImportantFile[]> => {
  const importantFiles: ImportantFile[] = []

  for (const fileName of IMPORTANT_FILES) {
    try {
      const filePath = join(workspaceRoot, fileName)
      const content = await readFile(filePath, 'utf-8')
      const relativePath = relative(workspaceRoot, filePath)

      importantFiles.push({
        path: relativePath,
        content: content.trim(),
      })
    } catch (error) {
      logger.debug(`Important file ${fileName} not found or couldn't be read`)
    }
  }

  return importantFiles
}

export const formatRulesContext = (
  rulesFiles: RuleFile[],
  importantFiles: ImportantFile[]
): string => {
  if (rulesFiles.length === 0 && importantFiles.length === 0) {
    return ''
  }

  let context = '\n\n// Project Context\n'

  if (rulesFiles.length > 0) {
    const briefRules = rulesFiles.filter((rule) => !rule.frontmatter?.alwaysApply)
    const alwaysApplyRules = rulesFiles.filter((rule) => rule.frontmatter?.alwaysApply)

    if (briefRules.length > 0) {
      context += 'See these rules files for more info:\n'
      for (const rule of briefRules) {
        context += `- ${rule.path}: ${rule.description}\n`
        if (rule.frontmatter?.globs?.length) {
          context += `  Applies to: ${rule.frontmatter.globs.join(', ')}\n`
        }
      }
      context += '\n'
    }

    if (alwaysApplyRules.length > 0) {
      context += 'Always-apply rules (full content):\n'
      for (const rule of alwaysApplyRules) {
        context += `\n## ${rule.path}\n${rule.content}\n`
      }
    }
  }

  if (importantFiles.length > 0) {
    context += 'Important project documentation:\n'
    for (const file of importantFiles) {
      context += `\n## ${file.path}\n${file.content}\n`
    }
  }

  return context
}
