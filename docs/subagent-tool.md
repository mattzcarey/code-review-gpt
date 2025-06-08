# SubAgent Tool

The SubAgent tool allows spawning autonomous sub-agents that can work independently on specific tasks while having access to the same toolkit as the main agent. This is particularly useful for delegating complex, token-heavy operations that can run asynchronously. The sub-agent always returns a structured report with its findings and recommendations.

## Overview

The SubAgent tool creates an isolated agent instance that:

- Receives a specific goal/task to accomplish
- Has access to all base tools plus MCP (Model Context Protocol) tools
- Runs autonomously with a configurable step limit
- Always returns a structured report with findings and recommendations
- Handles resource cleanup automatically

## Usage

### Basic Usage

```typescript
import { createSubAgentTool } from "./common/llm/tools";

const subAgentTool = createSubAgentTool(model);

// The tool is then available to the main agent
const result = await subAgentTool.execute({
  goal: "Analyze the authentication system and identify potential security vulnerabilities",
});
```

### Tool Parameters

| Parameter | Type   | Required | Default | Description                                                                                     |
| --------- | ------ | -------- | ------- | ----------------------------------------------------------------------------------------------- |
| `goal`    | string | Yes      | -       | The specific goal or task for the sub-agent to accomplish. Include as much context as possible. |

## Available Tools

The sub-agent has access to all base tools:

### File System Tools

- **`read_file`** - Read file contents with optional line range selection
- **`ls`** - List directory contents
- **`glob`** - Find files matching glob patterns

### Search Tools

- **`grep`** - Search for text patterns in files using regex

### Network Tools

- **`fetch`** - Make HTTP requests to external APIs

### System Tools

- **`bash`** - Execute bash commands with safety restrictions

### Utility Tools

- **`thinking`** - Internal reasoning and brainstorming tool

### MCP Tools

- Any additional tools provided by configured Model Context Protocol servers

## Behavior and Context

### Built-in Context

The sub-agent receives important contextual information:

- Current working directory
- TypeScript/JavaScript codebase assumption
- File exploration best practices
- Error handling guidance

### Exploration Strategy

The sub-agent is programmed to:

1. Use `ls` or `grep` tools first to explore codebase structure
2. Verify file paths before attempting to read them
3. Handle file not found errors gracefully
4. Work systematically towards the goal

### Report Structure

Every sub-agent execution returns a structured report containing:

- **Summary** - Brief overview of what was accomplished
- **Findings** - Detailed discoveries, analysis results, or observations
- **Recommendations** - Suggestions, improvements, or next steps (if applicable)
- **Conclusion** - Final assessment and key takeaways

If the sub-agent fails to provide adequate detail, a fallback report is generated with execution metadata including steps taken, tools used, and diagnostic information.

## Use Cases

### Code Analysis

```typescript
const analysisResult = await subAgentTool.execute({
  goal: "Examine the payment processing module for potential race conditions and suggest improvements",
});
```

### Security Auditing

```typescript
const securityResult = await subAgentTool.execute({
  goal: "Review authentication and authorization code for security vulnerabilities",
});
```

### Dependency Analysis

```typescript
const depResult = await subAgentTool.execute({
  goal: "Identify all external dependencies and check for known vulnerabilities",
});
```

### Performance Investigation

```typescript
const perfResult = await subAgentTool.execute({
  goal: "Analyze database query patterns and identify potential performance bottlenecks",
});
```

## Implementation Details

### Architecture

The SubAgent tool:

1. Creates a new `MCPClientManager` instance for tool access
2. Loads and starts all configured MCP clients
3. Combines base tools with MCP tools
4. Spawns an autonomous agent with the provided goal
5. Manages resource cleanup automatically

### Resource Management

- MCP clients are automatically initialized and cleaned up
- Each sub-agent runs in isolation
- Step limits prevent infinite execution
- Error handling ensures graceful failures

### Logging

The tool provides comprehensive logging:

- Sub-agent spawn events
- Available tool inventory
- Execution completion status
- Error conditions

## Best Practices

### Goal Definition

- Be specific and detailed in goal descriptions
- Provide necessary context about the codebase
- Include expected outcomes or deliverables
- Mention any specific files or modules to focus on

### Step Limits

- Use higher step limits (20-30) for complex analysis tasks
- Use lower step limits (10-15) for focused investigations
- Monitor token usage to balance thoroughness with cost

### Error Handling

- Always handle potential errors from sub-agent execution
- Check if the returned result contains meaningful conclusions
- Consider retry logic for critical tasks

## Integration

The SubAgent tool integrates seamlessly with the main agent system through the unified tool management API:

```typescript
import { getAllTools } from "./common/llm/tools";

const tools = await getAllTools({
  platformProvider,
  model,
  mcpClientManager: clients,
  includeSubAgent: true, // Enables the spawn_subagent tool
  maxSteps: 50, // Maximum number of steps the sub-agent can take
});
```

## Limitations

- Sub-agents cannot spawn other sub-agents (prevents infinite nesting)
- Limited by the step count to prevent runaway execution
- Inherits the same tool restrictions as the parent agent
- Cannot persist state between invocations
- MCP tool availability depends on server configuration

## Security Considerations

- Sub-agents inherit all security restrictions from base tools
- Bash tool includes built-in protection against dangerous commands
- Network requests are filtered to prevent internal network access
- File system access is limited to the current workspace

## Performance Notes

- Sub-agent execution is token-intensive due to autonomous operation
- Consider using sub-agents for tasks that justify the token cost
- Multiple sub-agents can run concurrently if needed
- MCP client initialization has a small overhead per invocation
