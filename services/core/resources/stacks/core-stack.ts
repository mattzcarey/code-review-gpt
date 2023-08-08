import { Stack, StackProps } from "aws-cdk-lib";
import { AttributeType, BillingMode, Table } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";

import { ReviewLambda } from "../../functions/review-lambda/config";
import { isProduction } from "../../helpers";

interface CoreStackProps extends StackProps {
  stage: string;
}

export class CoreStack extends Stack {
  constructor(scope: Construct, id: string, props: CoreStackProps) {
    super(scope, id, props);

    new ReviewLambda(this, "review-lambda");

    new Table(this, "user-database", {
      billingMode: BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: "PK",
        type: AttributeType.STRING,
      },
      sortKey: {
        name: "SK",
        type: AttributeType.STRING,
      },
      deletionProtection: isProduction(),
      pointInTimeRecovery: isProduction(),
    });
  }
}
