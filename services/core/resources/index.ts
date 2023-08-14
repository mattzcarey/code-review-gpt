#!/usr/bin/env node
import { App, Aspects, Tags } from "aws-cdk-lib";
import { RemovalPolicyAspect } from "../aspects/RemovalPolicyAspect";

import { buildResourceName, getRegion, getStage } from "../helpers";
import { CoreStack } from "./stacks/core-stack";

const app = new App();
const stage = getStage();
const region = getRegion();

const coreStack = new CoreStack(app, "crgpt-core", {
  stackName: buildResourceName("crgpt-core"),
  stage: stage,
  env: { region },
});

Aspects.of(coreStack).add(new RemovalPolicyAspect());

//enable OTel traces
Tags.of(app).add("baselime:tracing", `true`);
