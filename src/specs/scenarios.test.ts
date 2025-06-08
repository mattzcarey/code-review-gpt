import { describe, expect, test } from 'bun:test'
import { logger } from '../common/utils/logger'
import { ScenarioRunner } from './runner'
import { scenarioRegistry } from './scenarios'

// Set log level to info and above for tests (suppress debug messages)
logger.settings.minLevel = 3 // 0: silly, 1: trace, 2: debug, 3: info, 4: warn, 5: error, 6: fatal

describe('E2E Scenario Tests', () => {
  const runner = new ScenarioRunner('openai:gpt-4.1-mini', 25)

  // Test all registered scenarios
  for (const scenario of scenarioRegistry.getAll()) {
    test(scenario.name, async () => {
      logger.info(`\n🧪 Running scenario: ${scenario.name}`)
      logger.info(`📝 Description: ${scenario.description}`)

      if (scenario.tags) {
        logger.info(`🏷️  Tags: ${scenario.tags.join(', ')}`)
      }

      const result = await runner.runScenario(scenario)

      if (!result.passed) {
        logger.error(`❌ Scenario failed: ${scenario.name}`)
        logger.error('Errors:')
        for (const error of result.errors) {
          logger.error(`  - ${error}`)
        }

        logger.info('Tool calls made:')
        for (const call of result.toolCalls) {
          logger.info(`  - ${call.toolName}: ${JSON.stringify(call.args)}`)
        }

        logger.info(`Summary: ${result.summary}`)
      } else {
        logger.info(`✅ Scenario passed: ${scenario.name}`)
      }

      expect(result.passed).toBe(true)
    }, 300000) // 5 minute timeout per scenario
  }
})

describe('Scenario Registry', () => {
  test('should have scenarios registered', () => {
    const allScenarios = scenarioRegistry.getAll()
    expect(allScenarios.length).toBeGreaterThan(0)
  })

  test('should have scenarios with required fields', () => {
    for (const scenario of scenarioRegistry.getAll()) {
      expect(scenario.name).toBeDefined()
      expect(scenario.description).toBeDefined()
      expect(scenario.input).toBeDefined()
      expect(scenario.input.files).toBeDefined()
      expect(scenario.input.files.length).toBeGreaterThan(0)
      expect(scenario.expectations).toBeDefined()
      expect(scenario.expectations.shouldCallTools).toBeDefined()
    }
  })

  test('should have unique scenario names', () => {
    const allScenarios = scenarioRegistry.getAll()
    const names = allScenarios.map((s) => s.name)
    const uniqueNames = new Set(names)
    expect(names.length).toBe(uniqueNames.size)
  })

  test('should support tag filtering', () => {
    const secretScenarios = scenarioRegistry.getByTag('secrets')
    const subAgentScenarios = scenarioRegistry.getByTag('subagent')

    expect(secretScenarios.length).toBeGreaterThan(0)
    expect(subAgentScenarios.length).toBeGreaterThan(0)

    for (const scenario of secretScenarios) {
      expect(scenario.tags).toContain('secrets')
    }

    for (const scenario of subAgentScenarios) {
      expect(scenario.tags).toContain('subagent')
    }
  })
})
