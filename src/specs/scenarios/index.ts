import type { TestScenario } from './types'

/**
 * Registry of all test scenarios
 */
export class ScenarioRegistry {
  private scenarios: Map<string, TestScenario> = new Map()

  register(scenario: TestScenario): void {
    if (this.scenarios.has(scenario.name)) {
      throw new Error(`Scenario '${scenario.name}' is already registered`)
    }
    this.scenarios.set(scenario.name, scenario)
  }

  get(name: string): TestScenario | undefined {
    return this.scenarios.get(name)
  }

  getAll(): TestScenario[] {
    return Array.from(this.scenarios.values())
  }

  getByTag(tag: string): TestScenario[] {
    return this.getAll().filter(scenario => scenario.tags?.includes(tag))
  }

  clear(): void {
    this.scenarios.clear()
  }
}

// Global registry instance
export const scenarioRegistry = new ScenarioRegistry()

// Import and register all scenarios
import './secretDetection'
import './subAgentSpawning'
import './basicReview'