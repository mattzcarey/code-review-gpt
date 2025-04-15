import { tool } from 'ai';
import { z } from 'zod';

export const readFileTool = tool({
  description: 'Read a file',
  parameters: z.object({
    path: z.string().describe('The absolute path to the file to read'),
    startLine: z.number().optional().describe('The line number to start reading from'),
    endLine: z.number().optional().describe('The line number to end reading at'),
  }),
  execute: async ({ path, startLine, endLine }) => {
    const file = await Bun.file(path).text();
    const lines = file.split('\n');

    const defaultLinesToRead = 50;

    const startIndex = startLine ? startLine - 1 : 0;
    const endIndex = endLine ? endLine - 1 : startIndex + defaultLinesToRead;

    const selectedLines = lines.slice(startIndex, endIndex + 1);
    const content = selectedLines.join('\n');

    const prefix = `File content: ${path}\nLines: ${startIndex + 1} to ${endIndex + 1}:`;

    return `${prefix}\n${content}`;
  },
});
