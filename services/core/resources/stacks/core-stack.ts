import { Stack, StackProps } from "aws-cdk-lib";
import { LambdaIntegration } from "aws-cdk-lib/aws-apigateway";
import { Key } from "aws-cdk-lib/aws-kms";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import { DemoReviewLambda } from "../../functions/demo-review-lambda/config";

import { ReviewLambda } from "../../functions/review-lambda/config";
import { UpdateUserLambda } from "../../functions/update-user/config";
import { buildResourceName, getStage } from "../../helpers";
import { CoreApi } from "../constructs/api-gateway";
import { ReviewBucket } from "../constructs/review-bucket";
import { UserTable } from "../constructs/user-table";
import { AddUserLambda } from '../../functions/add-user/config';
import { build } from 'esbuild';
import { AUTH_TABLE_NAME } from '../../constants';
import { Table } from "aws-cdk-lib/aws-dynamodb";

interface CoreStackProps extends StackProps {
  stage: string;
}

export class CoreStack extends Stack {
  constructor(scope: Construct, id: string, props: CoreStackProps) {
    super(scope, id, props);

    const api = new CoreApi(this, "core-api");

    const userTable = new UserTable(this, "user-database");

    const reviewLambda = new ReviewLambda(this, "review-lambda");

    const postReviewRoute = api.root.addResource("postReview");
    postReviewRoute.addMethod("POST", new LambdaIntegration(reviewLambda));

    // We use a separate api for the demo review to enable strong throttling on it
    const demoApi = new CoreApi(this, "demo-api", {
      deployOptions: {
        throttlingBurstLimit: 1,
        throttlingRateLimit: 1,
      },
    });

    const demoReviewBucket = new ReviewBucket(this, "demo-review-bucket");

    const demoReviewLambda = new DemoReviewLambda(this, "demo-review-lambda", {
      table: userTable,
      bucket: demoReviewBucket,
    });

    const demoReviewRoute = demoApi.root.addResource("demoReview");
    demoReviewRoute.addMethod("POST", new LambdaIntegration(demoReviewLambda));

    // Resources for user management
    const kmsKey = new Key(this, "encryption-key", {
      enableKeyRotation: true,
      alias: `${getStage()}/encryption-key`,
    });

    const updateUserLambda = new UpdateUserLambda(this, "update-user-lambda", {
      table: userTable,
      kmsKey: kmsKey,
    });

    const updateUserRoute = api.root.addResource("updateUser");
    updateUserRoute.addMethod("POST", new LambdaIntegration(updateUserLambda));

    const addUserLambda = new AddUserLambda(this, "add-user-lambda", {
      table: userTable,
      authTable: Table.fromTableArn(this, "auth-table", "arn:aws:dynamodb:eu-west-2:384933632379:table/".concat(buildResourceName(AUTH_TABLE_NAME))) as Table,
      //authTable: Table.fromTableName(this, "authTable", buildResourceName(AUTH_TABLE_NAME)),
    });

    const addUserRoute = api.root.addResource("addUser");
    addUserRoute.addMethod("POST", new LambdaIntegration(addUserLambda));
  }
}
