import { Stack, StackProps } from "aws-cdk-lib";
import { LambdaIntegration, Period } from "aws-cdk-lib/aws-apigateway";
import { Table } from "aws-cdk-lib/aws-dynamodb";
import { Key } from "aws-cdk-lib/aws-kms";
import { Construct } from "constructs";

import { API_KEY_NAME } from "../../constants";
import { GetUserLambda } from "../../functions/get-user/config";
import { ReviewLambda } from "../../functions/review-lambda/config";
import { UpdateUserLambda } from "../../functions/update-user/config";
import { getCertificateArn, getDomainName, getStage } from "../../helpers";
import { OrionApi } from "../constructs/api-gateway";
import { UserTable } from "../constructs/user-table";

interface CoreStackProps extends StackProps {
  stage: string;
}

export class CoreStack extends Stack {
  userTable: Table;
  constructor(scope: Construct, id: string, props: CoreStackProps) {
    super(scope, id, props);

    //KMS
    const kmsKey = new Key(this, "encryption-key", {
      enableKeyRotation: true,
      alias: `${getStage()}/encryption-key`,
    });

    //DynamoDB
    this.userTable = new UserTable(this, "user-database");

    //Lambda
    const reviewLambda = new ReviewLambda(this, "review-lambda");
    const updateUserLambda = new UpdateUserLambda(this, "update-user-lambda", {
      table: this.userTable,
      kmsKey: kmsKey,
    });
    const getUserLambda = new GetUserLambda(this, "get-user-lambda", {
      table: this.userTable,
    });

    // Review API
    const reviewApi = new OrionApi(this, "review-api", {
      rootDomain: getDomainName(props.stage),
      subDomain: "api",
      certificateArn: getCertificateArn(this, "api"),
    });

    const postReviewRoute = reviewApi.root.addResource("postReview");
    postReviewRoute.addMethod("POST", new LambdaIntegration(reviewLambda));

    // User API
    const userApi = new OrionApi(this, "user-api", {
      rootDomain: getDomainName(props.stage),
      subDomain: "api",
      certificateArn: getCertificateArn(this, "api"),
      defaultMethodOptions: {
        apiKeyRequired: true,
      },
    });

    const updateUserRoute = userApi.root.addResource("updateUser");
    updateUserRoute.addMethod("POST", new LambdaIntegration(updateUserLambda));

    const getUserRoute = userApi.root.addResource("getUser");
    getUserRoute.addMethod("GET", new LambdaIntegration(getUserLambda));

    // Create Usage Plan
    const userApiUsagePlan = userApi.addUsagePlan("UserApiUsagePlan", {
      name: `default-usage-plan`,
      throttle: {
        rateLimit: 100,
        burstLimit: 200,
      },
      quota: {
        limit: 10000,
        period: Period.DAY,
      },
    });

    // Add Api Key to Usage Plan
    userApiUsagePlan.addApiKey(userApi.addApiKey(API_KEY_NAME));
    userApiUsagePlan.addApiStage({
      stage: userApi.deploymentStage,
    });
  }
}
