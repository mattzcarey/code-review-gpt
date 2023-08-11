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
} from "../../constants";
import { Table } from "aws-cdk-lib/aws-dynamodb";
import { Bucket } from "aws-cdk-lib/aws-s3";

export interface DemoReviewLambdaProps {
  table: Table;
  bucket: Bucket;
}

export class DemoReviewLambda extends NodejsFunction {
  constructor(scope: Construct, id: string, props: DemoReviewLambdaProps) {
    const { table, bucket } = props;

    super(scope, id, {
      functionName: buildResourceName(id),
      entry: join(__dirname, "index.ts"),
      handler: "main",
      runtime: Runtime.NODEJS_18_X,
      architecture: Architecture.ARM_64,
      environment: {
        OPENAI_API_KEY_PARAM_NAME: OPENAI_API_KEY_PARAM_NAME,
        LANGCHAIN_API_KEY_PARAM_NAME: LANGCHAIN_API_KEY_PARAM_NAME,
        LANGCHAIN_TRACING_V2: "true",
        LANGCHAIN_PROJECT: "demo-review",
        // LANGCHAIN_ENDPOINT: "https://api.smith.langchain.com",
        TABLE_NAME: table.tableName,
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
