import * as iam from 'aws-cdk-lib/aws-iam';
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { join } from "path";

import {
  commonLambdaEnvironment,
  commonLambdaProps,
} from "../../cdk-helpers/lambda";
import { buildResourceName } from "../../helpers";

export class AddRepoLambda extends NodejsFunction {
  constructor(scope: Construct, id: string) {
    const authDB = buildResourceName("web-app-auth");
    const coreDB = buildResourceName("crgpt-data");

    super(scope, id, {
      ...commonLambdaProps,
      functionName: buildResourceName(id),
      entry: join(__dirname, "index.ts"),
      environment: {
        ...commonLambdaEnvironment,
        AUTH_DB: authDB,
        CORE_DB: coreDB,
      },
    });

    const dynamoDbPolicyStatement = new iam.PolicyStatement({
      actions: [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:Query",
      ],
      resources: ["*"],
    });

    this.addToRolePolicy(dynamoDbPolicyStatement);
  }
}
