import { generateText, tool, type LanguageModelV1, type Tool } from 'ai'
import { z } from 'zod'
import { logger } from '../../utils/logger'
import { MCPClientManager } from '../mcp/client'
import {
  bashTool,
  fetchTool,
  globTool,
  grepTool,
  lsTool,
  readFileTool,
  thinkingTool,
} from './index'

export const createSubAgentTool = (parentModel: LanguageModelV1) => {
  return tool({
    description:
      'Spawn a sub-agent with a specific goal that runs autonomously with access to all available tools. The sub-agent will work towards the goal and return its final conclusion. Use this subagent to run token heavy tasks which can be run async from the main agent.',
    parameters: z.object({
      goal: z
        .string()
        .describe(
          'The specific goal or task for the sub-agent to accomplish. Include as much context as possible to help the sub-agent understand the goal.'
        ),
      maxSteps: z
        .number()
        .describe('Maximum number of steps the sub-agent can take')
        .default(15),
    }),
    execute: async ({ goal, maxSteps }) => {
      try {
        logger.info(`Spawning sub-agent with goal: ${goal}`)
        const model: LanguageModelV1 = parentModel

        // Initialize MCP clients for additional tools
        const clients = new MCPClientManager()
        await clients.loadConfig()
        await clients.startClients()

        const mcpTools: Record<string, Tool> = {}
        for (const [serverName, tools] of Object.entries(await clients.getTools())) {
          for (const [toolName, tool] of Object.entries(tools)) {
            mcpTools[`${serverName}-${toolName}`] = tool
          }
        }

        // Prepare all available tools
        const tools = {
          read_file: readFileTool,
          fetch: fetchTool,
          glob: globTool,
          grep: grepTool,
          ls: lsTool,
          bash: bashTool,
          thinking: thinkingTool,
          ...mcpTools,
        }

        logger.debug('Sub-agent tools available:', Object.keys(tools))

        // Create the prompt for the sub-agent
        const prompt = `You are an autonomous sub-agent with the following goal:

GOAL: ${goal}

You have access to various tools to help you accomplish this goal. Work systematically towards the goal, using the available tools as needed. 

When you have completed the goal or reached a conclusion, provide a clear final summary of what you accomplished and any findings.

Take your time to think through the problem and use the tools effectively to gather information and make progress towards the goal.`

        // Run the sub-agent
        const result = await generateText({
          model,
          prompt,
          tools,
          maxSteps,
        })

        // Clean up MCP clients
        await clients.closeClients()

        logger.info('Sub-agent completed execution')

        // Return the final text result
        return result.text || 'Sub-agent completed but provided no final output.'
      } catch (error) {
        logger.error('Error in sub-agent execution:', error)
        if (error instanceof Error) {
          return `Error executing sub-agent: ${error.message}`
        }
        return 'Unknown error occurred while executing sub-agent'
      }
    },
  })
}
