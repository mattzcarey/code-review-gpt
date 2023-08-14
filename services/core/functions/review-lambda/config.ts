import { Duration, Stack } from "aws-cdk-lib";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Architecture, Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { join } from "path";
import { buildResourceName } from "../../helpers";
import {
  LANGCHAIN_API_KEY_PARAM_NAME,
  OPENAI_API_KEY_PARAM_NAME,
  GITHUB_SECRET_PARAM_NAME,
} from "../../constants";
import { commonLambdaEnvironment } from "../helpers/commonLambdaEnvironment";
import { commonLambdaProps } from "../helpers/commonLambdaProps";
import { reviewLambdaEnvironment } from "../helpers/reviewLambdaEnvironment";

export class ReviewLambda extends NodejsFunction {
  constructor(scope: Construct, id: string) {
    super(scope, id, {
      ...commonLambdaProps,
      functionName: buildResourceName(id),
      entry: join(__dirname, "index.ts"),
      environment: {
        GITHUB_SECRET_PARAM_NAME: GITHUB_SECRET_PARAM_NAME,
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

    const githubSecretParameterStoreArn = Stack.of(scope).formatArn({
      service: "ssm",
      resource: "parameter",
      resourceName: GITHUB_SECRET_PARAM_NAME,
    });

    const langchainApiKeyParameterStoreArn = Stack.of(scope).formatArn({
      service: "ssm",
      resource: "parameter",
      resourceName: LANGCHAIN_API_KEY_PARAM_NAME,
    });

    this.addToRolePolicy(
      new PolicyStatement({
        actions: ["ssm:GetParameter"],
        resources: [
          openAIApiKeyParameterStoreArn,
          githubSecretParameterStoreArn,
          langchainApiKeyParameterStoreArn,
        ],
      })
    );
  }
}
