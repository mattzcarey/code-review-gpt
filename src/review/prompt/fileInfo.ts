import { relative } from 'node:path'
import type { LineRange, ReviewFile } from '../../common/types'

// Define the structure for a node in the file tree
interface TreeNode {
  name: string
  children: { [key: string]: TreeNode }
  isEndOfPath?: boolean // Mark if a node represents a file
  changedLines?: LineRange[] // Store changed lines for file nodes
  fullPath?: string // Optional: Store full path for context if needed
}

/**
 * Builds a file tree structure from a list of ReviewFile objects.
 * Uses paths relative to the workspace root.
 * @param files - An array of ReviewFile objects with absolute paths.
 * @param workspaceRoot - The absolute path to the workspace root.
 * @returns The root TreeNode of the generated file tree.
 */
const buildFileTree = (files: ReviewFile[], workspaceRoot: string): TreeNode => {
  const root: TreeNode = { name: 'root', children: {} }

  for (const file of files) {
    // Use path relative to workspace root for building the tree structure
    const relativePath = relative(workspaceRoot, file.fileName)
    const parts = relativePath.split('/')
    let currentNode = root

    for (const [index, part] of parts.entries()) {
      if (!part) continue // Skip empty parts (e.g., from multiple slashes)

      if (!currentNode.children[part]) {
        currentNode.children[part] = { name: part, children: {} }
      }
      currentNode = currentNode.children[part]
      if (index === parts.length - 1) {
        currentNode.isEndOfPath = true // Mark as a file
        currentNode.changedLines = file.changedLines // Store the changed lines
        currentNode.fullPath = file.fileName // Store original full path if needed
      }
    }
  }

  return root
}

/**
 * Formats line ranges into a compact string.
 * E.g., [{start: 1, end: 1}, {start: 5, end: 7}] -> "1, 5-7"
 * E.g., [{start: 10, end: 10, isPureDeletion: true}] -> "10 (deletion)"
 * @param ranges - Array of LineRange objects.
 * @returns A formatted string representation of the line ranges.
 */
const formatLineRanges = (ranges?: LineRange[]): string => {
  if (!ranges || ranges.length === 0) {
    return ''
  }
  // Sort ranges just in case they aren't
  ranges.sort((a, b) => a.start - b.start)
  return ranges
    .map((range) => {
      if (range.isPureDeletion) {
        return `${range.start} (deletion)`
      }
      return range.start === range.end ? `${range.start}` : `${range.start}-${range.end}`
    })
    .join(', ')
}

/**
 * Formats a file tree node and its children into a string representation.
 * Includes changed line numbers for file nodes.
 * @param node - The TreeNode to format.
 * @param prefix - The prefix string for indentation and tree lines.
 * @param isLast - Whether this node is the last child of its parent.
 * @returns A string representation of the file tree branch.
 */
const formatTreeToString = (node: TreeNode, prefix = '', isLast = true): string => {
  let output = ''
  // Only add the node itself to the output if it's not the root
  if (node.name !== 'root') {
    let nodeString = `${prefix}${isLast ? '└── ' : '├── '}${node.name}`
    // If it's a file node, append the formatted line ranges
    if (node.isEndOfPath) {
      const formattedLines = formatLineRanges(node.changedLines)
      if (formattedLines) {
        nodeString += `: ${formattedLines}`
      }
    }
    output += `${nodeString}\n`
  }

  const childrenKeys = Object.keys(node.children).sort() // Sort for consistent order
  for (const [index, key] of childrenKeys.entries()) {
    const child = node.children[key]
    const isLastChild = index === childrenKeys.length - 1
    // Adjust prefix for children:
    // - If the current node is not root, add padding based on whether it was the last child.
    // - If the current node is root, children start with no padding.
    const childPrefix = node.name === 'root' ? '' : `${prefix}${isLast ? '    ' : '│   '}`
    output += formatTreeToString(child, childPrefix, isLastChild)
  }

  return output
}

/**
 * Creates a preamble string containing context for the AI review.
 * Includes a placeholder for the review goal and a file tree visualization
 * of the files, including changed line numbers.
 *
 * @param files - An array of ReviewFile objects representing all files changed in the review.
 * @param workspaceRoot - The absolute path to the workspace root (used for relative paths).
 * @param goal - Optional review goal string.
 * @returns A markdown formatted string to be prepended to the AI prompt.
 */
export const createFileInfo = (files: ReviewFile[], workspaceRoot: string): string => {
  const fileTree = buildFileTree(files, workspaceRoot || '')
  const fileTreeString = formatTreeToString(fileTree, '', true).trim()

  return `Files changed for this review (paths relative to root, includes line ranges):\n${fileTreeString}\n---\n`
}
