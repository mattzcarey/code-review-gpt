import { tool } from 'ai';
import { z } from 'zod';
import { getLanguageName } from '../../../review/prompt/utils/fileLanguage';

export const readFileTool = tool({
  description:
    'Read the current state of a file or part of a file. You should use this tool to gather specific context. You should use this in conjunction with the read_diff tool to get the full picture of the changes. You should read several lines before and after the changes. You may need to go back and read more lines.',
  parameters: z.object({
    path: z.string().describe('The absolute path to the file to read'),
    startLine: z.number().optional().describe('The line number to start reading from.'),
    endLine: z.number().optional().describe('The line number to end reading at.'),
  }),
  execute: async ({ path, startLine, endLine }) => {
    const file = await Bun.file(path).text();
    const lines = file.split('\n');

    const defaultLinesToRead = 200;

    const startIndex = startLine ? startLine - 1 : 0;
    const endIndex = endLine ? endLine - 1 : startIndex + defaultLinesToRead;

    const selectedLines = lines.slice(startIndex, endIndex + 1);
    const content = selectedLines.join('\n');

    const prefix = `Here is the file excerpt you requested. NOTE that unless an EOF is shown, the file is not complete. File path: ${path}\nLines Selected: ${startIndex + 1} to ${endIndex + 1}:\n\n`;
    const language = getLanguageName(path, '');

    return `${prefix}\`\`\`${language.toLowerCase()}\n${content}\`\`\``;
  },
});
