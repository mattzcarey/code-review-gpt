import { AttributeType, BillingMode, Table } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";

import { buildResourceName, isProduction } from "../env-helpers";

export class DDBTable extends Table {
  constructor(scope: Construct, id: string) {
    super(scope, id, {
      tableName: buildResourceName(id),
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
