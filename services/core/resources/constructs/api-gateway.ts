import { RestApi, RestApiProps } from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";
import { buildResourceName } from "../../helpers";

export interface CoreApiProps extends Omit<RestApiProps, "restApiName"> {}

export class CoreApi extends RestApi {
  constructor(scope: Construct, id: string, props?: CoreApiProps) {
    super(scope, id, {
      ...props,
      restApiName: buildResourceName(id),
      deployOptions: {
        ...props?.deployOptions,
        tracingEnabled: true,
      },
    });
  }
}
