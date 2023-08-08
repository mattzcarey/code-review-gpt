#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { CoreStack } from "./stacks/core-stack";

const app = new cdk.App();
new CoreStack(app, "crgpt-core-stack", {
  stackName: "crgpt-core-stack", //todo buildResourceName
  tags: {
    environment: "dev",
    team: "CRGPT Team",
    compliance: "normal",
    alarmSeverity: "low",
    CostCenter: "TBD",
  },
});
