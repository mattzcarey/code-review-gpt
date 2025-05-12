# Model Context Protocol (MCP) Configuration

This document outlines how to configure MCP servers for your project.

## Configuration File

MCP servers are configured using a JSON configuration file at `.shippie/mcp.json`. This file defines the MCP servers available to the shippie agent.

Shippie will also pick up servers from a `.cursor/mcp.json` file in the root of your project. See more details [here](https://docs.cursor.com/context/model-context-protocol).

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    }
  }
}
```

## Server Configuration Options

### Command-Based Servers

For servers that are executed as STDIO commands:

```json
"serverName": {
    "command": "npx",
    "args": ["-y", "@package/mcp-server"]
}
```

### URL-Based Servers

For servers that are accessed via URLs (SSE-based):

```json
"serverName": {
    "url": "https://your-mcp-server.example.com/sse",
    "headers": {
        "Authorization": "Bearer your_token"
    }
}
```

## Private Variables

Private variables using GitHub Actions syntax (`${{ env.SOME_ENV_VARIABLE }}`) will be supported in a future release. This will enable:

```json
"serverName": {
    "command": "npx",
    "args": ["-y", "@package/mcp-server"],
    "env": {
        "API_KEY": "${{ env.SERVER_API_KEY }}"
    }
}
```
