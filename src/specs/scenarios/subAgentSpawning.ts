import type { TestScenario } from './types'

const subAgentScenarios: TestScenario[] = [
  {
    name: 'Testing Strategy Sub-Agent',
    description:
      'Should spawn sub-agent when asked to develop comprehensive testing strategy',
    tags: ['subagent', 'testing'],
    input: {
      files: [
        {
          fileName: 'src/payment-processor.ts',
          content: `export class PaymentProcessor {
  private apiKey: string
  private baseUrl: string

  constructor(apiKey: string, baseUrl: string = 'https://api.payments.com') {
    this.apiKey = apiKey
    this.baseUrl = baseUrl
  }

  async processPayment(amount: number, currency: string, cardToken: string): Promise<PaymentResult> {
    if (amount <= 0) {
      throw new Error('Amount must be positive')
    }

    if (!this.isValidCurrency(currency)) {
      throw new Error('Invalid currency')
    }

    const response = await fetch(\`\${this.baseUrl}/charges\`, {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${this.apiKey}\`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100),
        currency: currency.toLowerCase(),
        card_token: cardToken
      })
    })

    if (!response.ok) {
      throw new Error(\`Payment failed: \${response.statusText}\`)
    }

    const result = await response.json()
    return {
      id: result.id,
      status: result.status,
      amount: result.amount / 100,
      currency: result.currency
    }
  }

  private isValidCurrency(currency: string): boolean {
    const validCurrencies = ['USD', 'EUR', 'GBP', 'CAD']
    return validCurrencies.includes(currency.toUpperCase())
  }
}

export interface PaymentResult {
  id: string
  status: 'success' | 'failed' | 'pending'
  amount: number
  currency: string
}`,
          changedLines: [
            1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
            23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41,
            42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53,
          ],
        },
      ],
      customInstructions:
        'Please use a sub-agent to develop a comprehensive testing strategy for this payment processing code. Include unit tests, integration tests, edge cases, error scenarios, and security considerations.',
    },
    expectations: {
      shouldCallTools: ['submit_summary'],
      minimumToolCalls: 1,
      maximumToolCalls: 30,
    },
  },
]

export { subAgentScenarios }
