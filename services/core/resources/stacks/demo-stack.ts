import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { LambdaIntegration } from "aws-cdk-lib/aws-apigateway";
import { Table } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";

import { getCertificateArn } from "../../cdk-helpers/certificates";
import { DemoReviewLambda } from "../../functions/demo-review-lambda/config";
import { getDomainName } from "../../helpers";
import { OrionApi } from "../constructs/api-gateway";
import { ReviewBucket } from "../constructs/review-bucket";

interface DemoStackProps extends StackProps {
  stage: string;
  table: Table;
}

export class DemoStack extends Stack {
  constructor(scope: Construct, id: string, props: DemoStackProps) {
    super(scope, id, props);

    // Separate API for the demo to enable strong throttling
    const demoApi = new OrionApi(this, "demo-api", {
      deployOptions: {
        throttlingBurstLimit: 1,
        throttlingRateLimit: 1,
      },
      rootDomain: getDomainName(props.stage),
      subDomain: "demo",
      certificateArn: getCertificateArn(this, "demo"),
    });

    //Resources
    const demoReviewBucket = new ReviewBucket(this, "demo-review-bucket");

    //Lambda
    const demoReviewLambda = new DemoReviewLambda(this, "demo-review-lambda", {
      table: props.table,
      bucket: demoReviewBucket,
    });

    //Routes
    const demoReviewRoute = demoApi.root.addResource("demoReview");
    demoReviewRoute.addMethod("POST", new LambdaIntegration(demoReviewLambda));

    //Exports
    new CfnOutput(this, "demoUrl", {
      value: demoApi.url,
      exportName: `${props.stage}DemoUrl`,
    });
  }
}
