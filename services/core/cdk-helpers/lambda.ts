import { Duration } from "aws-cdk-lib";
import { Architecture, Runtime, Tracing } from "aws-cdk-lib/aws-lambda";
import { NodejsFunctionProps } from "aws-cdk-lib/aws-lambda-nodejs";

import { getRegion, getStage } from "../env-helpers";

export const commonLambdaEnvironment: Record<string, string> = {
  STAGE: getStage(),
  REGION: getRegion(),
};

const cdkEsbuildConfig: NodejsFunctionProps["bundling"] = {
  minify: true,
  keepNames: true,
  sourceMap: true,
  externalModules: ["aws-sdk"],
  target: "node18",
  mainFields: ["module", "main"],
  metafile: true,
};

export const commonLambdaProps: Omit<NodejsFunctionProps, "code"> = {
  runtime: Runtime.NODEJS_18_X,
  handler: "main",
  memorySize: 512,
  awsSdkConnectionReuse: true,
  architecture: Architecture.ARM_64,
  timeout: Duration.seconds(600),
  bundling: cdkEsbuildConfig,
  tracing: Tracing.ACTIVE,
};
