import { Stack, StackProps } from "aws-cdk-lib";
import { Table } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";

import {
  buildResourceName,
  getCertificateArn,
  getDomainName,
} from "../../helpers";
import { OrionApi } from "../constructs/api-gateway";
import { LambdaIntegration } from "aws-cdk-lib/aws-apigateway";
import { EventBus } from "aws-cdk-lib/aws-events";
import { RoutingLambda } from "../../functions/routing-lambda/config";
import { LambdaFunction } from "aws-cdk-lib/aws-events-targets";
import { Rule } from "aws-cdk-lib/aws-events";
import { ReviewLambda } from "../../functions/review-lambda/config";
import { WEBHOOK_EVENT_BUS_NAME } from "../../constants";

interface WebhookStackProps extends StackProps {
  stage: string;
}

export class WebhookStack extends Stack {
  userTable: Table;
  constructor(scope: Construct, id: string, props: WebhookStackProps) {
    super(scope, id, props);

    //API
    const api = new OrionApi(this, "webhook-api", {
      rootDomain: getDomainName(props.stage),
      subDomain: "webhook",
      certificateArn: getCertificateArn(this, "webhook"),
    });

    //EventBus
    const eventBus = new EventBus(this, WEBHOOK_EVENT_BUS_NAME, {
      eventBusName: buildResourceName(WEBHOOK_EVENT_BUS_NAME),
    });

    //Lambda
    const reviewLambda = new ReviewLambda(this, "review-lambda");
    const routingLambda = new RoutingLambda(this, "routing-lambda", {
      eventBus,
    });

    //Routes
    const webhookRoute = api.root.addResource("webhook");
    webhookRoute.addMethod("POST", new LambdaIntegration(routingLambda));

    // EventBridge Rule
    const eventRule = new Rule(this, "WebhookEventRule", {
      eventBus: eventBus,
      eventPattern: {
        detailType: ["WebhookRequestEvent"],
      },
    });
    // Add the Lambda function as a target for the EventBridge rule
    eventRule.addTarget(new LambdaFunction(reviewLambda));
  }
}
