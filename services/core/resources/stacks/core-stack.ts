import { Stack, StackProps } from "aws-cdk-lib";
import { LambdaIntegration } from "aws-cdk-lib/aws-apigateway";
import { Key } from "aws-cdk-lib/aws-kms";
import { Construct } from "constructs";
import { DemoReviewLambda } from "../../functions/demo-review-lambda/config";
import { GetUserLambda } from "../../functions/get-user/config";
import { ReviewLambda } from "../../functions/review-lambda/config";
import { UpdateUserLambda } from "../../functions/update-user/config";
import { getCertificateArn, getDomainName, getStage } from "../../helpers";
import { CoreApi } from "../constructs/api-gateway";
import { ReviewBucket } from "../constructs/review-bucket";
import { UserTable } from "../constructs/user-table";

interface CoreStackProps extends StackProps {
  stage: string;
}

export class CoreStack extends Stack {
  constructor(scope: Construct, id: string, props: CoreStackProps) {
    super(scope, id, props);

    const api = new CoreApi(this, "core-api", {
      domainNameString: `api.${getDomainName(props.stage)}`,
      certificateArn: getCertificateArn(this, props.stage, "api"),
    });

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
      domainNameString: `demo.${getDomainName(props.stage)}`,
      certificateArn: getCertificateArn(this, props.stage, "demo"),
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

    const getUserLambda = new GetUserLambda(this, "get-user-lambda", {
      table: userTable,
    });

    const getUserRoute = api.root.addResource("getUser");
    getUserRoute.addMethod("GET", new LambdaIntegration(getUserLambda));
  }
}
