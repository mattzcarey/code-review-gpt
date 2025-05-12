export interface TokenUsage {
  promptTokens: number
  completionTokens: number
  totalTokens: number
}

export interface ToolCall {
  name: string
  // biome-ignore lint/suspicious/noExplicitAny: fine for ToolCall generics
  args: any
  // biome-ignore lint/suspicious/noExplicitAny: fine for ToolCall generics
  result: any
  retry: number
}
