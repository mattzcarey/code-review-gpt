import { Table } from "aws-cdk-lib/aws-dynamodb";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { join } from "path";

import {
  buildResourceName,
  commonLambdaEnvironment,
  commonLambdaProps,
} from "../../helpers";

type AddRepoLambdaProps = {
  table: Table;
};

export class AddRepoLambda extends NodejsFunction {
  constructor(scope: Construct, id: string, props: AddRepoLambdaProps) {
    const { table } = props;

    super(scope, id, {
      ...commonLambdaProps,
      functionName: buildResourceName(id),
      entry: join(__dirname, "index.ts"),
      environment: {
        ...commonLambdaEnvironment,
      },
    });

    table.grantWriteData(this);
  }
}
