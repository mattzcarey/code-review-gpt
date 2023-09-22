import { Duration } from "aws-cdk-lib";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { join } from "path";

import {
  commonLambdaEnvironment,
  commonLambdaProps,
} from "../../cdk-helpers/lambda";
import { buildResourceName } from "../../helpers";
import { reviewLambdaEnvironment } from "../utils/reviewLambdaEnvironment";

export class TestLambda extends NodejsFunction {
  constructor(scope: Construct, id: string) {
    super(scope, id, {
      ...commonLambdaProps,
      functionName: buildResourceName(id),
      entry: join(__dirname, "index.ts"),
      environment: {
        LANGCHAIN_PROJECT: "review",
        ...commonLambdaEnvironment,
        ...reviewLambdaEnvironment,
      },
      timeout: Duration.seconds(60),
    });
  }
}
