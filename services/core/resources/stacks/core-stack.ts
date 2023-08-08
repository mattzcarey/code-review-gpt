import { Stack, StackProps } from "aws-cdk-lib";
import { AttributeType, BillingMode, Table } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";

import { ReviewLambda } from "../../functions/review-lambda/config";
import { UpdateUserLambda } from "../../functions/update-user/config";
import { buildResourceName, isProduction } from "../../helpers";

interface CoreStackProps extends StackProps {
  stage: string;
}

export class CoreStack extends Stack {
  constructor(scope: Construct, id: string, props: CoreStackProps) {
    super(scope, id, props);

    new ReviewLambda(this, "review-lambda");

    const userTable = new Table(this, "user-database", {
      tableName: buildResourceName("user-database"),
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

    new UpdateUserLambda(this, "update-user-lambda", {
      table: userTable,
    });
  }
}
