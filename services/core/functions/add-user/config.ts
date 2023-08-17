import { Table } from "aws-cdk-lib/aws-dynamodb";
import { Architecture, Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { join } from "path";
import { buildResourceName } from "../../helpers";

interface AddUserLambdaProps {
  table: Table;
  authTable: Table;
}

export class AddUserLambda extends NodejsFunction {
  constructor(scope: Construct, id: string, props: AddUserLambdaProps) {
    const { table, authTable } = props;

    super(scope, id, {
      functionName: buildResourceName(id),
      entry: join(__dirname, "index.ts"),
      handler: "main",
      runtime: Runtime.NODEJS_18_X,
      architecture: Architecture.ARM_64,
      environment: {
        TABLE_NAME: table.tableName,
      },
    });

    table.grantReadWriteData(this);
    authTable.grantStream(this);
  }
}
