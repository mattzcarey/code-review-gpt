import { defaultStage } from "./config";
import { getArg } from "./getArg";

export const getStage = (): string => {
  return getArg({
    cliArg: "stage",
    processEnvName: "STAGE",
    defaultValue: defaultStage,
  });
};
