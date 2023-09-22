import * as iam from 'aws-cdk-lib/aws-iam';
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { join } from "path";

import {
  commonLambdaEnvironment,
  commonLambdaProps,
} from "../../cdk-helpers/lambda";
import { buildResourceName, getRegion } from "../../helpers";

export class AddRepoLambda extends NodejsFunction {
  constructor(scope: Construct, id: string) {
    const authDB = buildResourceName("web-app-auth");
    const coreDB = buildResourceName("crgpt-data");
    const region = getRegion();
    const account = process.env.CDK_DEFAULT_ACCOUNT ?? "";

    super(scope, id, {
      ...commonLambdaProps,
      functionName: buildResourceName(id),
      entry: join(__dirname, "index.ts"),
      environment: {
        ...commonLambdaEnvironment,
      },
    });

    const dynamoDbPolicyStatement = new iam.PolicyStatement({
      actions: [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:Query",
      ],
      resources: [
        `arn:aws:dynamodb:${region}:${account}:table/${authDB}`, 
        `arn:aws:dynamodb:${region}:${account}:table/${authDB}/index/GSI1`, 
        `arn:aws:dynamodb:${region}:${account}:table/${coreDB}`
      ],
    });

    this.addToRolePolicy(dynamoDbPolicyStatement);
  }
}
