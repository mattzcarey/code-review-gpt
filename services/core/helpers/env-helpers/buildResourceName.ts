import { getStage } from "./getStage";

export const buildResourceName = (resourceName: string): string =>
  `${getStage()}-${resourceName}`;
