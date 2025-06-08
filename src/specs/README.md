# E2E Testing Framework

This directory contains the end-to-end testing framework for Shippie's code review functionality. The framework is designed to test tool calling behavior, validation logic, and overall agent performance in realistic scenarios.

## Architecture

### Core Components

- **Scenario Registry** (`scenarios/index.ts`): Central registry for all test scenarios
- **Scenario Runner** (`runner/index.ts`): Executes scenarios and validates results  
- **Test Scenarios** (`scenarios/*.ts`): Individual scenario definitions
- **Scenario Builder** (`utils/scenarioBuilder.ts`): Builder pattern for creating scenarios

### Key Features

1. **Tool Call Validation**: Verify which tools are called and their arguments
2. **Execution Order Testing**: Ensure tools are called in the correct sequence
3. **Content Validation**: Check that summaries contain expected keywords
4. **Flexible Assertions**: Support for min/max tool calls, forbidden tools, etc.
5. **Tag-based Organization**: Group scenarios by functionality (secrets, subagent, etc.)

## Scenario Types

### Secret Detection
Tests that the agent properly identifies and flags security issues:
- Exposed API keys and secrets
- Hardcoded credentials  
- Environment variable recommendations

### Sub-Agent Spawning
Tests that the agent spawns sub-agents when appropriate:
- Complex algorithmic analysis
- Security audits
- Large-scale refactoring

### Code Quality
Tests general code review capabilities:
- TypeScript type errors
- Performance issues
- Best practice violations

## Writing Test Scenarios

### Using the Builder Pattern

```typescript
import { ScenarioBuilder, TestFiles, Validators } from '../utils/scenarioBuilder'
import { scenarioRegistry } from './index'

const scenario = ScenarioBuilder
  .create('My Test Scenario')
  .description('Tests that the agent handles X correctly')
  .tags('security', 'secrets')
  .withFile('src/config.ts', TestFiles.withExposedSecrets().content)
  .shouldCall('suggest_change', 'submit_summary')
  .shouldNotCall('spawn_subagent')
  .summaryContains('secret', 'security')
  .validateTool('suggest_change', 1, Validators.secretSuggestion('config.ts'))
  .expectToolCalls(2, 4)
  .build()

scenarioRegistry.register(scenario)
```

### Manual Scenario Definition

```typescript
const scenario: TestScenario = {
  name: 'Custom Scenario',
  description: 'Tests custom behavior',
  tags: ['custom'],
  input: {
    files: [{
      fileName: 'src/test.ts',
      content: 'const x = 1',
      changedLines: [1]
    }],
    customInstructions: 'Please review this code carefully'
  },
  expectations: {
    shouldCallTools: ['submit_summary'],
    shouldNotCallTools: ['spawn_subagent'],
    summaryContains: ['review'],
    minimumToolCalls: 1,
    maximumToolCalls: 2
  }
}
```

## Available Validations

### Tool Call Validations

- **shouldCallTools**: Tools that must be called
- **shouldNotCallTools**: Tools that must not be called  
- **minimumToolCalls**: Minimum number of tool calls
- **maximumToolCalls**: Maximum number of tool calls
- **toolCallOrder**: Enforce tool calling order
- **toolCallValidation**: Custom argument validation

### Summary Validations

- **summaryContains**: Required text in final summary
- **summaryDoesNotContain**: Forbidden text in summary

### Custom Validators

The framework provides common validators:

- `Validators.secretSuggestion(fileName)`: Validates secret-related suggestions
- `Validators.subAgentGoal(...terms)`: Validates sub-agent goals contain terms
- `Validators.commentContains(...terms)`: Validates comment content

## Running Tests

```bash
# Run all E2E tests
bun test:e2e

# Run specific scenarios by tag
bun test src/specs/scenarios.test.ts --grep "Secret Detection"

# Run with verbose logging  
MODEL_NAME=openai:gpt-4o bun test src/specs/scenarios.test.ts
```

## Test Configuration

Tests can be configured via environment variables:

- `MODEL_NAME`: LLM model to use (default: openai:gpt-4o-mini)
- `LOG_LEVEL`: Logging level (debug, info, warn, error)

## Adding New Scenarios

1. Create a new file in `scenarios/` (e.g., `myFeature.ts`)
2. Define scenarios using the builder pattern or manual definition
3. Register scenarios with `scenarioRegistry.register(scenario)`  
4. Import the file in `scenarios/index.ts`
5. Run tests to verify scenarios work correctly

## Best Practices

1. **Use descriptive names**: Scenario names should clearly indicate what's being tested
2. **Add relevant tags**: Use tags to group related scenarios  
3. **Validate tool arguments**: Use custom validators to check tool call arguments
4. **Test edge cases**: Include both positive and negative test cases
5. **Keep files small**: Focus each scenario on a specific behavior
6. **Use helpers**: Leverage `TestFiles` and `Validators` for common patterns

## Debugging Failed Tests

When tests fail, the framework provides detailed information:

- List of tool calls made vs expected
- Tool call arguments and validation failures  
- Summary content analysis
- Execution order violations

Check the test output and logs to understand why a scenario failed and adjust expectations or fix the underlying issue.