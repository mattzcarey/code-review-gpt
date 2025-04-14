import type { PromptFile } from '../../../common/types';

// Define the structure for a node in the file tree
interface TreeNode {
  name: string;
  children: { [key: string]: TreeNode };
  isEndOfPath?: boolean; // Mark if a node represents a file
}

/**
 * Builds a file tree structure from a list of file paths.
 * @param files - An array of PromptFile objects.
 * @returns The root TreeNode of the generated file tree.
 */
const buildFileTree = (files: PromptFile[]): TreeNode => {
  const root: TreeNode = { name: 'root', children: {} };

  for (const file of files) {
    const parts = file.fileName.split('/');
    let currentNode = root;

    for (const [index, part] of parts.entries()) {
      if (!currentNode.children[part]) {
        currentNode.children[part] = { name: part, children: {} };
      }
      currentNode = currentNode.children[part];
      if (index === parts.length - 1) {
        currentNode.isEndOfPath = true; // Mark as a file
      }
    }
  }

  return root;
};

/**
 * Formats a file tree node and its children into a string representation.
 * @param node - The TreeNode to format.
 * @param prefix - The prefix string for indentation and tree lines.
 * @param isLast - Whether this node is the last child of its parent.
 * @returns A string representation of the file tree branch.
 */
const formatTreeToString = (node: TreeNode, prefix = '', isLast = true): string => {
  let output = '';
  // Only add the node itself to the output if it's not the root
  if (node.name !== 'root') {
    output += `${prefix}${isLast ? '└── ' : '├── '}${node.name}\n`;
  }

  const childrenKeys = Object.keys(node.children);
  for (const [index, key] of childrenKeys.entries()) {
    const child = node.children[key];
    const isLastChild = index === childrenKeys.length - 1;
    // Adjust prefix for children:
    // - If the current node is not root, add padding based on whether it was the last child.
    // - If the current node is root, children start with no padding.
    const childPrefix = node.name === 'root' ? '' : `${prefix}${isLast ? '    ' : '│   '}`;
    output += formatTreeToString(child, childPrefix, isLastChild);
  }

  return output;
};

/**
 * Creates a preamble string containing context for the AI review.
 * Includes a placeholder for the review goal and a file tree visualization of the files.
 *
 * @param allChangedFiles - An array of PromptFile objects representing all files changed in the review.
 * @returns A markdown formatted string to be prepended to the AI prompt.
 */
export const createReviewPreamble = (allChangedFiles: PromptFile[]): string => {
  // const fileList = allChangedFiles.map((file) => `- ${file.fileName}`).join('\n');
  const fileTree = buildFileTree(allChangedFiles);
  // Start formatting from the root, assuming root itself isn't displayed
  const fileTreeString = formatTreeToString(fileTree, '', true).trim(); // Trim trailing newline

  return `Review Goal: [Goal placeholder - to be implemented]\n\nFiles changed for this review:\n${fileTreeString}\n---\n`;
};
