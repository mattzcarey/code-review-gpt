import { Duration, Stack } from "aws-cdk-lib";
import { Table } from "aws-cdk-lib/aws-dynamodb";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import { join } from "path";

import {
  LANGCHAIN_API_KEY_PARAM_NAME,
  OPENAI_API_KEY_PARAM_NAME,
} from "../../constants";
import { buildResourceName } from "../../helpers";
import { commonLambdaEnvironment } from "../helpers/commonLambdaEnvironment";
import { commonLambdaProps } from "../helpers/commonLambdaProps";
import { reviewLambdaEnvironment } from "../helpers/reviewLambdaEnvironment";

export interface DemoReviewLambdaProps {
  table: Table;
  bucket: Bucket;
}

export class DemoReviewLambda extends NodejsFunction {
  constructor(scope: Construct, id: string, props: DemoReviewLambdaProps) {
    const { table, bucket } = props;

    super(scope, id, {
      ...commonLambdaProps,
      functionName: buildResourceName(id),
      entry: join(__dirname, "index.ts"),
      environment: {
        ...commonLambdaEnvironment,
        ...reviewLambdaEnvironment,
        LANGCHAIN_PROJECT: "demo-review",
        BUCKET_NAME: bucket.bucketName,
      },
      timeout: Duration.seconds(60),
    });

    // Grant the Lambda function permissions to access Parameter Store
    const openAIApiKeyparameterStoreArn = Stack.of(scope).formatArn({
      service: "ssm",
      resource: "parameter",
      resourceName: OPENAI_API_KEY_PARAM_NAME,
    });

    const langchainApiKeyparameterStoreArn = Stack.of(scope).formatArn({
      service: "ssm",
      resource: "parameter",
      resourceName: LANGCHAIN_API_KEY_PARAM_NAME,
    });

    this.addToRolePolicy(
      new PolicyStatement({
        actions: ["ssm:GetParameter"],
        resources: [
          openAIApiKeyparameterStoreArn,
          langchainApiKeyparameterStoreArn,
        ],
      })
    );

    table.grantWriteData(this);
    bucket.grantPut(this);
  }
}
