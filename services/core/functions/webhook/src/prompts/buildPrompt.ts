import { reviewPrompt } from "../constants";

export const buildPrompt = (patch: string): string => {
  return `${reviewPrompt}
    ${patch}`;
};
