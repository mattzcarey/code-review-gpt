import { tool } from 'ai'
import { z } from 'zod'

export const thinkingTool = tool({
  description:
    'Use the tool to think about something. It will not obtain new information or make any changes to the repository, but just log the thought. Use it when complex reasoning or brainstorming is needed. For example, if you explore the repo and discover a potential bug, call this tool to brainstorm all the unexpected behaviour the code might exhibit, and assess which suggested changes are needed. Alternatively, if you receive some test results, call this tool to brainstorm ways to fix the failing tests. Finally, if you are unsure if a change in the code base warrants a suggestion from you, call this tool to understand the impact of the change.',
  parameters: z.object({
    thought: z.string().describe('Your thoughts'),
  }),
  execute: async ({ thought }) => {
    return thought
  },
})
