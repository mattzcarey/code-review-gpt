#!/usr/bin/env node
import { App, Aspects, Tags } from "aws-cdk-lib";
import * as dotenv from "dotenv";

import { WebhookStack } from "./stack";
import { RemovalPolicyAspect } from "../constructs/aspects";
import { getRegion, getStage } from "../env-helpers";

dotenv.config();

const app = new App();

//Env
const stage = getStage();
const region = getRegion();

//Stacks
new WebhookStack(app, `${stage}-crgpt-webhook`, {
  stage,
  env: { region, account: process.env.CDK_DEFAULT_ACCOUNT },
});

//Aspects
Aspects.of(app).add(new RemovalPolicyAspect());

//Tags
Tags.of(app).add("baselime:tracing", `true`);
