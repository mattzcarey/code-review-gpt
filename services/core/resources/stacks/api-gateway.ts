import { RestApi } from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";
import { buildResourceName } from "../../helpers";

export class CoreApi extends RestApi {
  constructor(scope: Construct, id: string) {
    super(scope, id, {
      restApiName: buildResourceName(id),
      deployOptions: {
        tracingEnabled: true,
      },
    });
  }
}
