import { defaultRegion } from "./config";
import { getArg } from "./getArg";

export const getRegion = (): string =>
  getArg({
    cliArg: "region",
    processEnvName: "REGION",
    defaultValue: defaultRegion,
  });
