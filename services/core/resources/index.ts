#!/usr/bin/env node
import { App, Aspects, Tags } from "aws-cdk-lib";

import { CoreStack } from "./stacks/core-stack";
import { DemoStack } from "./stacks/demo-stack";
import { RemovalPolicyAspect } from "../aspects/RemovalPolicyAspect";
import { buildResourceName, getRegion, getStage } from "../helpers";

const app = new App();

//Env
const stage = getStage();
const region = getRegion();

//Stacks
const coreStack = new CoreStack(app, "crgpt-core", {
  stackName: buildResourceName("crgpt-core"),
  stage: stage,
  env: { region, account: process.env.CDK_DEFAULT_ACCOUNT },
});

const demoStack = new DemoStack(app, "crgpt-demo", {
  stackName: buildResourceName("crgpt-demo"),
  stage: stage,
  env: { region, account: process.env.CDK_DEFAULT_ACCOUNT },
  userTable: coreStack.userTable,
});

//Aspects
Aspects.of(coreStack).add(new RemovalPolicyAspect());
Aspects.of(demoStack).add(new RemovalPolicyAspect());

//OTel traces
Tags.of(app).add("baselime:tracing", `true`);
