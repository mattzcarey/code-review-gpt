import { reviewPrompt, takeADeepBreath } from "./prompts";

export const buildReviewPrompt = (patch: string): string => {
  return `${reviewPrompt}\n\n${patch}\n\n${takeADeepBreath}`;
};
