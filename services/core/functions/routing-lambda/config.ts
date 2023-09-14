import { EventBus } from "aws-cdk-lib/aws-events";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { join } from "path";

import { GITHUB_WEBHOOK_SECRET_PARAM_NAME } from "../../constants";
import { buildResourceName, commonLambdaProps } from "../../helpers";

type RoutingLambdaProps = {
  eventBus: EventBus;
};

export class RoutingLambda extends NodejsFunction {
  constructor(scope: Construct, id: string, props: RoutingLambdaProps) {
    super(scope, id, {
      ...commonLambdaProps,
      functionName: buildResourceName(id),
      entry: join(__dirname, "index.ts"),
      environment: {
        EVENT_BUS_NAME: props.eventBus.eventBusName,
        GITHUB_WEBHOOK_SECRET_PARAM_NAME: GITHUB_WEBHOOK_SECRET_PARAM_NAME,
      },
    });

    // Grant permissions
    props.eventBus.grantPutEventsTo(this);
  }
}
