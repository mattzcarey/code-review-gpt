import { reviewPrompt, takeADeepBreath } from "./prompts";

export const buildReviewPrompt = (patch: string): string => {
  return `Human:${reviewPrompt}\n\n${patch}\n\n${takeADeepBreath}\n\nAssistant:`;
};
