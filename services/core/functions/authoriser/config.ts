import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { join } from "path";
import { buildResourceName } from "../../helpers";
import { commonLambdaEnvironment } from "../helpers/commonLambdaEnvironment";
import { commonLambdaProps } from "../helpers/commonLambdaProps";

export class ApiAuthoriserLambda extends NodejsFunction {
  constructor(scope: Construct, id: string) {
    super(scope, id, {
      ...commonLambdaProps,
      functionName: buildResourceName(id),
      entry: join(__dirname, "index.ts"),
      environment: {
        ...commonLambdaEnvironment,
        JWT_SECRET_PARAM_NAME: JWT_SECRET_PARAM_NAME,

      },
    });
  }
}
