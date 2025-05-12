import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { type Tool, experimental_createMCPClient } from 'ai'
import { Experimental_StdioMCPTransport as StdioMCPTransport } from 'ai/mcp-stdio'
import { getGitRoot } from '../../git/getChangedFilesNames'
import { logger } from '../../utils/logger'

interface MCPClient {
  tools: () => Promise<Record<string, Tool>>
  close: () => Promise<void>
}

interface MCPServerConfig {
  command?: string
  args?: string[]
  type?: string
  url?: string
  headers?: Record<string, string>
}

interface MCPConfig {
  mcpServers: Record<string, MCPServerConfig>
}

export class MCPClientManager {
  private clients: Record<string, MCPClient | null> = {}
  private config: MCPConfig | null = null

  async loadConfig(): Promise<void> {
    try {
      const workspacePath = await getGitRoot()
      const configPath = join(workspacePath, '.shippie', 'mcp.json')
      const configContent = await readFile(configPath, 'utf-8')
      this.config = JSON.parse(configContent) as MCPConfig
    } catch (error) {
      logger.error(`Failed to load MCP config: ${error}`)
      this.config = null
    }
  }

  async startClients(): Promise<void> {
    if (!this.config) {
      logger.error('Cannot start clients: MCP config not loaded')
      return
    }

    for (const [serverName, serverConfig] of Object.entries(this.config.mcpServers)) {
      try {
        if (serverConfig.command && serverConfig.args) {
          // Use StdioMCPTransport for command-based configuration
          const transport = new StdioMCPTransport({
            command: serverConfig.command,
            args: serverConfig.args,
          })

          this.clients[serverName] = await experimental_createMCPClient({
            transport,
          })
          logger.info(`Started MCP client for ${serverName}`)
        } else if (serverConfig.type === 'sse' && serverConfig.url) {
          // Use SSE transport directly for URL-based configuration
          this.clients[serverName] = await experimental_createMCPClient({
            transport: {
              type: 'sse',
              url: serverConfig.url,
              headers: serverConfig.headers,
            },
          })
        } else {
          logger.error(`Invalid MCP server configuration for ${serverName}`)
          this.clients[serverName] = null
        }
      } catch (error) {
        logger.error(`Failed to create MCP client for ${serverName}: ${error}`)
        this.clients[serverName] = null
      }
    }
  }

  async getTools(): Promise<Record<string, Record<string, Tool>>> {
    const allTools: Record<string, Record<string, Tool>> = {}

    for (const [serverName, client] of Object.entries(this.clients)) {
      if (client) {
        try {
          allTools[serverName] = await client.tools()
        } catch (error) {
          logger.error(`Failed to get tools from ${serverName}: ${error}`)
          allTools[serverName] = {}
        }
      }
    }

    return allTools
  }

  async closeClients(): Promise<void> {
    for (const [serverName, client] of Object.entries(this.clients)) {
      if (client) {
        try {
          await client.close()
        } catch (error) {
          logger.error(`Failed to close MCP client ${serverName}: ${error}`)
        }
      }
    }

    this.clients = {}
  }
}
