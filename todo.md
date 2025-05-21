TO THE AI.

This package is a code review tool. It is built to be ran with bun as a cli tools primarily during a CI pipeline.

Ethos of the package:

- Beautiful cli tool with typescript and bun
- Works well in Github Actions
- Abstracts the model being used with ai sdk
- Functions as a human code reviewer would using a small set of tools which are highly optimised for code review
- Used Model Context Protocol (MCP) client for users to plug in external tools such as browser use, infrastructure deployments, observability monitoring.

Go through these todos, one by one. When they are complete add a ✅ to the left of the todo. If you fail to do them add a ❌ to the left of the todo.

TODO:

- context window management - ie we should know if we are getting dangerously close to the end and we should automatically try and compress the context window before resuming the review.
- landing page
- premium mcp servers
- better docs
- telemetry on errors
- telemetry on ai usage
