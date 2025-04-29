export interface ReviewResponse {
  success: boolean;
  message: string;
}

export interface AIUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}
