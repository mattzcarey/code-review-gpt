import { getStage } from "./getStage";

export const isProduction = (): boolean => {
  const stage = getStage();

  return stage === "prod" || stage === "production";
};

export const isStaging = (): boolean => {
  const stage = getStage();

  return stage === "staging";
};

export const isDev = (): boolean => {
  if (isProduction() || isStaging()) {
    return false;
  }

  return true;
};
