import { Table } from "aws-cdk-lib/aws-dynamodb";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { join } from "path";

import {
  buildResourceName,
  commonLambdaEnvironment,
  commonLambdaProps,
} from "../../helpers";

type GetUserLambdaProps = {
  table: Table;
};

export class GetUserLambda extends NodejsFunction {
  constructor(scope: Construct, id: string, props: GetUserLambdaProps) {
    const { table } = props;

    super(scope, id, {
      ...commonLambdaProps,
      functionName: buildResourceName(id),
      entry: join(__dirname, "index.ts"),
      environment: {
        ...commonLambdaEnvironment,
      },
    });

    table.grantReadData(this);
  }
}
