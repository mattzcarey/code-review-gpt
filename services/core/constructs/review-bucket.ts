import { RemovalPolicy } from "aws-cdk-lib";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

import { buildResourceName, isProduction } from "../env-helpers";

export class ReviewBucket extends Bucket {
  constructor(scope: Construct, id: string) {
    super(scope, id, {
      bucketName: buildResourceName(id),
      enforceSSL: true,
      removalPolicy: isProduction()
        ? RemovalPolicy.RETAIN
        : RemovalPolicy.DESTROY,
      // autoDeleteObjects: !isProduction(),
    });
  }
}
