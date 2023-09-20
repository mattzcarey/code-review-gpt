import { Table } from "aws-cdk-lib/aws-dynamodb";
import { Key } from "aws-cdk-lib/aws-kms";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { join } from "path";

import {
  commonLambdaEnvironment,
  commonLambdaProps,
} from "../../cdk-helpers/lambda";
import { buildResourceName } from "../../helpers";

type UpdateUserLambdaProps = {
  table: Table;
  kmsKey: Key;
};

export class UpdateUserLambda extends NodejsFunction {
  constructor(scope: Construct, id: string, props: UpdateUserLambdaProps) {
    const { table, kmsKey } = props;

    super(scope, id, {
      ...commonLambdaProps,
      functionName: buildResourceName(id),
      entry: join(__dirname, "index.ts"),
      environment: {
        ...commonLambdaEnvironment,
        KMS_KEY_ID: kmsKey.keyId,
      },
    });

    table.grantWriteData(this);
    kmsKey.grantEncryptDecrypt(this);
  }
}
