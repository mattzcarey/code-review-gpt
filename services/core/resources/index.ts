#!/usr/bin/env node
import { App, Aspects, Tags } from "aws-cdk-lib";

import { WebhookStack } from "./stack";
import { RemovalPolicyAspect } from "../constructs/aspects";
import { getRegion, getStage } from "../env-helpers";

const app = new App();

//Env
const stage = getStage();
const region = getRegion();

//Stacks
new WebhookStack(app, `${stage}-crgpt-webhook`, {
  stage,
  env: { region },
});

//Aspects
Aspects.of(app).add(new RemovalPolicyAspect());

//Tags
Tags.of(app).add("baselime:tracing", `true`);
