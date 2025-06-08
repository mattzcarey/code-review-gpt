import type { Tool } from 'ai'
import { bashTool } from './bash'
import { fetchTool } from './fetch'
import { globTool } from './glob'
import { grepTool } from './grep'
import { lsTool } from './ls'
import { readFileTool } from './readFile'
import { thinkingTool } from './thinking'

export const getBaseTools = (): Record<string, Tool> => ({
  read_file: readFileTool,
  fetch: fetchTool,
  glob: globTool,
  grep: grepTool,
  ls: lsTool,
  bash: bashTool,
  thinking: thinkingTool,
})

import type { LanguageModelV1 } from 'ai'
import type { PlatformProvider } from '../../platform/provider'
import type { MCPClientManager } from '../mcp/client'
import { createReadDiffTool } from './readDiff'
import { createSubAgentTool } from './subAgent'
import { createSubmitSummaryTool } from './submitSummary'
import { createSuggestChangesTool } from './suggestChanges'

export interface GetAllToolsOptions {
  platformProvider?: PlatformProvider
  model?: LanguageModelV1
  mcpClientManager?: MCPClientManager
  includeSubAgent?: boolean
  maxSteps?: number
}

export const getAllTools = async (
  options: GetAllToolsOptions = {}
): Promise<Record<string, Tool>> => {
  const tools = { ...getBaseTools() }

  if (options.platformProvider) {
    tools.read_diff = createReadDiffTool(options.platformProvider)
    tools.suggest_change = createSuggestChangesTool(options.platformProvider)
    tools.submit_summary = createSubmitSummaryTool(options.platformProvider)
  }

  if (options.model && options.includeSubAgent && options.maxSteps) {
    tools.spawn_subagent = createSubAgentTool(options.model, options.maxSteps)
  }

  if (options.mcpClientManager) {
    const mcpTools: Record<string, Tool> = {}
    for (const [serverName, tools] of Object.entries(
      await options.mcpClientManager.getTools()
    )) {
      for (const [toolName, tool] of Object.entries(tools)) {
        mcpTools[`${serverName}-${toolName}`] = tool
      }
    }
    Object.assign(tools, mcpTools)
  }

  return tools
}

export {
  bashTool,
  thinkingTool,
  fetchTool,
  globTool,
  grepTool,
  lsTool,
  createReadDiffTool,
  readFileTool,
  createSubmitSummaryTool,
  createSuggestChangesTool,
  createSubAgentTool,
}
