import { Duration, Stack } from "aws-cdk-lib";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { join } from "path";

import {
  commonLambdaEnvironment,
  commonLambdaProps,
} from "../../cdk-helpers/lambda";
import {
  GITHUB_APP_ID_PARAM_NAME,
  GITHUB_APP_PRIVATE_KEY_PARAM_NAME,
  LANGCHAIN_API_KEY_PARAM_NAME,
  OPENAI_API_KEY_PARAM_NAME,
} from "../../constants";
import { buildResourceName } from "../../helpers";
import { reviewLambdaEnvironment } from "../utils/reviewLambdaEnvironment";

export class ReviewLambda extends NodejsFunction {
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

    // Grant the Lambda function permissions to access Parameter Store
    const openAIApiKeyParameterStoreArn = Stack.of(scope).formatArn({
      service: "ssm",
      resource: "parameter",
      resourceName: OPENAI_API_KEY_PARAM_NAME,
    });
    
    const langchainApiKeyParameterStoreArn = Stack.of(scope).formatArn({
      service: "ssm",
      resource: "parameter",
      resourceName: LANGCHAIN_API_KEY_PARAM_NAME,
    });

    const githubAppIdParameterStoreArn = Stack.of(scope).formatArn({
      service: "ssm",
      resource: "parameter",
      resourceName: GITHUB_APP_ID_PARAM_NAME,
    });

    const githubAppPrivateKeyParameterStoreArn = Stack.of(scope).formatArn({
      service: "ssm",
      resource: "parameter",
      resourceName: GITHUB_APP_PRIVATE_KEY_PARAM_NAME,
    });

    this.addToRolePolicy(
      new PolicyStatement({
        actions: ["ssm:GetParameter"],
        resources: [
          openAIApiKeyParameterStoreArn,
          langchainApiKeyParameterStoreArn,
          githubAppIdParameterStoreArn,
          githubAppPrivateKeyParameterStoreArn,
        ],
      })
    );
  }
}
