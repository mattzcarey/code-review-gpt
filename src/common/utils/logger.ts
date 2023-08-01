import { Logger } from "tslog";

export const logger = new Logger({
  prettyLogTemplate: "{{logLevelName}}\t",
});
