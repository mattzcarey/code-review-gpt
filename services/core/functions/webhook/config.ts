import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { join } from "path";

import { commonLambdaProps } from "../../cdk-helpers/lambda";
import {
  buildResourceName,
  getEnvVariable,
  getEnvVariableOrDefault,
} from "../../env-helpers";

export class WebhookLambda extends NodejsFunction {
  constructor(scope: Construct, id: string) {
    super(scope, id, {
      ...commonLambdaProps,
      functionName: buildResourceName(id),
      entry: join(__dirname, "index.ts"),
      environment: {
        APP_ID: getEnvVariable("APP_ID"),
        PRIVATE_KEY: getEnvVariable("PRIVATE_KEY"),
        WEBHOOK_SECRET: getEnvVariable("WEBHOOK_SECRET"),
        NODE_ENV: getEnvVariableOrDefault("NODE_ENV", "production"),
        LOG_LEVEL: getEnvVariableOrDefault("LOG_LEVEL", "info"),
      },
    });
  }
}
