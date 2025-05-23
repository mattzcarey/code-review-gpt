/**
 * Constants for formatting comments
 */
export const FORMATTING = {
  SUMMARY_TITLE: '## General Summary 🏴‍☠️',
  SEPARATOR: '\n\n---\n\n',
  SIGN_OFF:
    '### Review powered by [Shippie 🚢](https://github.com/mattzcarey/shippie) - The open source, extensible review agent.',
  CTA: `<details>
<summary>Enjoying Shippie? 🚢</summary>

🤝 Sponsored by: [Your Company Here](https://sustain.dev/sponsor/shippie)

</details>`,
  TOOL_CALLS_TITLE: '🛠️ Tool Calls',
  TOKEN_USAGE_TITLE: '📊 Token Usage',
}

/**
 * Formats a thread comment with title, content, and sign-off
 */
export const formatSummary = (comment: string): string => {
  return `${FORMATTING.SUMMARY_TITLE}\n\n${comment}${FORMATTING.SEPARATOR}${FORMATTING.SIGN_OFF}\n\n${FORMATTING.CTA}`
}
