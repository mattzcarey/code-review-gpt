#!/usr/bin/env node
import { App, Aspects, Tags } from "aws-cdk-lib";

import { RemovalPolicyAspect } from "../aspects";
import { getRegion, getStage } from "../helpers";
import { CoreStack, DemoStack } from "./stacks";
import { WebhookStack } from "./stacks/webhook-stack";

const app = new App();

//Env
const stage = getStage();
const region = getRegion();

//Stacks
const coreStack = new CoreStack(app, "crgpt-core", {
  stage,
  env: { region, account: process.env.CDK_DEFAULT_ACCOUNT },
});

new DemoStack(app, "crgpt-demo", {
  stage,
  env: { region, account: process.env.CDK_DEFAULT_ACCOUNT },
  userTable: coreStack.userTable,
});

new WebhookStack(app, "crgpt-webhook", {
  stage,
  env: { region, account: process.env.CDK_DEFAULT_ACCOUNT },
});

//Aspects
Aspects.of(app).add(new RemovalPolicyAspect());

//Tags
Tags.of(app).add("baselime:tracing", `true`);
