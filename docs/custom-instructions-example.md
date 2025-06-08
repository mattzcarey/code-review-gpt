# Custom Instructions Example

The `--customInstructions` flag allows you to provide specific guidance to the review agent.

## Usage

```bash
shippie review --customInstructions="Focus on security best practices and performance optimization"
```

## Examples

### Security-focused review

```bash
shippie review --customInstructions="Pay special attention to SQL injection vulnerabilities, XSS risks, and ensure proper input validation"
```

### Performance-focused review

```bash
shippie review --customInstructions="Focus on performance optimization, memory usage, and algorithm efficiency"
```

### Framework-specific guidelines

```bash
shippie review --customInstructions="Follow React best practices, ensure proper hook usage, and check for memory leaks"
```

The custom instructions are inserted into the review prompt and guide the agent's analysis of your code changes.
