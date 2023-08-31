import { AttributeType, BillingMode, Table } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";

import { TABLE_NAME } from "../../constants";
import { buildResourceName, isProduction } from "../../helpers";

export class UserTable extends Table {
  constructor(scope: Construct, id: string) {
    super(scope, id, {
      tableName: buildResourceName(TABLE_NAME),
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
