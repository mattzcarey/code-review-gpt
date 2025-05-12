# Model Context Protocol (MCP) Configuration

Shippie can debug failures in obscure browsers, perform QA testing, understand the original goal of the ticket and generally do all the things a human would do using external tools supplied via MCP servers.

You can give the shippie agent access to a web browser, database, documentation, project management systems or any other external tools.

Shippie acts as an MCP client, like Cursor, Windsurf, VSCode and Claude.

## Configuration File

MCP servers are configured using a JSON configuration file using the `.shippie/mcp.json` or `.cursor/mcp.json` file. This file defines the MCP servers available to the shippie agent.

See the [Cursor MCP documentation](https://docs.cursor.com/context/model-context-protocol).

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
