#!/usr/bin/env node
import { App, Aspects } from "aws-cdk-lib";
import { RemovalPolicyAspect } from "../aspects/RemovalPolicyAspect";

import { CoreStack } from "./stacks/core-stack";
import { buildResourceName, getStage, getRegion } from "../helpers";

const app = new App();
const stage = getStage();
const region = getRegion();

const coreStack = new CoreStack(app, "crgpt-core-stack", {
  stackName: buildResourceName("crgpt-core-stack"),
  stage: stage,
  env: { region },
});

Aspects.of(coreStack).add(new RemovalPolicyAspect());
