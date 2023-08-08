#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { CoreStack } from "./stacks/core-stack";
import { buildResourceName, getStage } from "../helpers/env-helpers";

const app = new cdk.App();
const stage = getStage();

new CoreStack(app, `${stage}-crgpt-core-stack`, {
  stackName: buildResourceName("crgpt-core-stack"),
  stage: stage,
  // env: { region },
});
