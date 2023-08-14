import { Architecture, Runtime, Tracing } from "aws-cdk-lib/aws-lambda";
import { NodejsFunctionProps } from "aws-cdk-lib/aws-lambda-nodejs";
import { sharedCdkEsbuildConfig } from "./sharedCdkEsbuildconfig";

export const commonLambdaProps: Omit<NodejsFunctionProps, "code"> = {
  runtime: Runtime.NODEJS_18_X,
  handler: "main",
  memorySize: 512,
  awsSdkConnectionReuse: true,
  architecture: Architecture.ARM_64,
  bundling: sharedCdkEsbuildConfig,
  tracing: Tracing.ACTIVE,
};
