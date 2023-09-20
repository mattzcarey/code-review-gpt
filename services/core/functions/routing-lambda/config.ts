import { Stack } from "aws-cdk-lib";
import { EventBus } from "aws-cdk-lib/aws-events";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { join } from "path";

import { commonLambdaProps } from "../../cdk-helpers/lambda";
import { GITHUB_WEBHOOK_SECRET_PARAM_NAME } from "../../constants";
import { buildResourceName } from "../../helpers";

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

    // Grant permissions for EventBus
    props.eventBus.grantPutEventsTo(this);

    // Grant permissions for ParameterStore
    const githubSecretParameterStoreArn = Stack.of(scope).formatArn({
      service: "ssm",
      resource: "parameter",
      resourceName: GITHUB_WEBHOOK_SECRET_PARAM_NAME,
    });

    this.addToRolePolicy(
      new PolicyStatement({
        actions: ["ssm:GetParameter"],
        resources: [githubSecretParameterStoreArn],
      })
    );
  }
}
