import { StackProps } from "aws-cdk-lib";
import { Architecture, Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";

export const ReviewLambda = (scope: Construct, props: StackProps): void => {
  new NodejsFunction(scope, "review-lambda", {
    functionName:"review-lambda",
    entry: "./index.ts",
    handler: "handler",
    runtime: Runtime.NODEJS_18_X,
    architecture: Architecture.ARM_64,
  });
};
