import { Stack, StackProps } from "aws-cdk-lib";
import {
  AuthorizationType,
  IdentitySource,
  LambdaIntegration,
  RequestAuthorizer,
  TokenAuthorizer,
} from "aws-cdk-lib/aws-apigateway";
import { Table } from "aws-cdk-lib/aws-dynamodb";
import { Key } from "aws-cdk-lib/aws-kms";
import { Construct } from "constructs";
import { GetUserLambda } from "../../functions/get-user/config";
import { ReviewLambda } from "../../functions/review-lambda/config";
import { UpdateUserLambda } from "../../functions/update-user/config";
import { getCertificateArn, getDomainName, getStage } from "../../helpers";
import { OrionApi } from "../constructs/api-gateway";
import { UserTable } from "../constructs/user-table";
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";

import { ApiAuthoriserLambda } from "../../functions/authoriser/config";
import {
  HttpLambdaAuthorizer,
  HttpLambdaResponseType,
} from "@aws-cdk/aws-apigatewayv2-authorizers-alpha";

interface CoreStackProps extends StackProps {
  stage: string;
}

export class CoreStack extends Stack {
  userTable: Table;
  constructor(scope: Construct, id: string, props: CoreStackProps) {
    super(scope, id, props);

    //API
    const api = new OrionApi(this, "core-api", {
      rootDomain: getDomainName(props.stage),
      subDomain: "api",
      certificateArn: getCertificateArn(this, "api"),
    });

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
    const authoriserLambda = new ApiAuthoriserLambda(
      this,
      "apigateway-authoriser-lambda"
    );

    //API Authoriser
    const authorizer = new TokenAuthorizer(this, "api-authoriser", {
      handler: authoriserLambda,
    });

    //Routes
    const postReviewRoute = api.root.addResource("postReview");
    postReviewRoute.addMethod("POST", new LambdaIntegration(reviewLambda));

    const updateUserRoute = api.root.addResource("updateUser");
    updateUserRoute.addMethod("POST", new LambdaIntegration(updateUserLambda), {
      authorizationType: AuthorizationType.CUSTOM,
      authorizer: authorizer,
    });

    const getUserRoute = api.root.addResource("getUser");
    getUserRoute.addMethod("GET", new LambdaIntegration(getUserLambda), {
      authorizationType: AuthorizationType.CUSTOM,
      authorizer: authorizer,
    });
  }
}
