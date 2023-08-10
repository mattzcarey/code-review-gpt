import { Stack, StackProps } from "aws-cdk-lib";
import { LambdaIntegration } from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";

import { ReviewLambda } from "../../functions/review-lambda/config";
import { UpdateUserLambda } from "../../functions/update-user/config";
import { CoreApi } from "./api-gateway";
import { UserTable } from "./user-table";

interface CoreStackProps extends StackProps {
  stage: string;
}

export class CoreStack extends Stack {
  constructor(scope: Construct, id: string, props: CoreStackProps) {
    super(scope, id, props);

    const api = new CoreApi(this, "api");

    const userTable = new UserTable(this, "user-database");

    const updateUserLambda = new UpdateUserLambda(this, "update-user-lambda", {
      table: userTable,
    });

    const reviewLambda = new ReviewLambda(this, "review-lambda");

    const updateUserRoute = api.root.addResource("updateUser");
    updateUserRoute.addMethod("POST", new LambdaIntegration(updateUserLambda));

    const postReviewRoute = api.root.addResource("postReview");
    postReviewRoute.addMethod("POST", new LambdaIntegration(reviewLambda));
  }
}
