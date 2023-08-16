import { getRegion, getStage } from "../../helpers";

export const commonLambdaEnvironment: Record<string, string> = {
  STAGE: getStage(),
  REGION: getRegion(),
};
