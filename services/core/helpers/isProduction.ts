import { getStage } from "./env-helpers";

export const isProduction = (): boolean => {
  const stage = getStage();

  return stage === "prod" || stage === "production";
};
