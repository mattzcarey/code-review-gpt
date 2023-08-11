import { Stack, StackProps } from "aws-cdk-lib";
import { LambdaIntegration } from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";
import { DemoReviewLambda } from "../../functions/demo-review-lambda/config";

import { ReviewLambda } from "../../functions/review-lambda/config";
import { UpdateUserLambda } from "../../functions/update-user/config";
import { CoreApi } from "../constructs/api-gateway";
import { UserTable } from "../constructs/user-table";

interface CoreStackProps extends StackProps {
  stage: string;
}

export class CoreStack extends Stack {
  constructor(scope: Construct, id: string, props: CoreStackProps) {
    super(scope, id, props);

    const api = new CoreApi(this, "core-api");

    const userTable = new UserTable(this, "user-database");

    const updateUserLambda = new UpdateUserLambda(this, "update-user-lambda", {
      table: userTable,
    });

    const reviewLambda = new ReviewLambda(this, "review-lambda");

    const updateUserRoute = api.root.addResource("updateUser");
    updateUserRoute.addMethod("POST", new LambdaIntegration(updateUserLambda));

    const postReviewRoute = api.root.addResource("postReview");
    postReviewRoute.addMethod("POST", new LambdaIntegration(reviewLambda));

    // We use a separate api for the demo review to enable strong throttling on it
    const demoApi = new CoreApi(this, "demo-api", {
      deployOptions: {
        throttlingBurstLimit: 1,
        throttlingRateLimit: 1,
      },
    });

    const demoReviewLambda = new DemoReviewLambda(this, "demo-review-lambda", {
      table: userTable,
    });

    const demoReviewRoute = demoApi.root.addResource("demoReview");
    demoReviewRoute.addMethod("POST", new LambdaIntegration(demoReviewLambda));
  }
}
