import { Table } from "aws-cdk-lib/aws-dynamodb";
import { Architecture, Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { join } from "path";
import { buildResourceName } from "../../helpers";
import { commonLambdaEnvironment } from "../helpers/commonLambdaEnvironment";
import { commonLambdaProps } from "../helpers/commonLambdaProps";

interface UpdateUserLambdaProps {
  table: Table;
}

export class UpdateUserLambda extends NodejsFunction {
  constructor(scope: Construct, id: string, props: UpdateUserLambdaProps) {
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
