import { Stack, StackProps } from "aws-cdk-lib";
import { LambdaIntegration } from "aws-cdk-lib/aws-apigateway";
import { Table } from "aws-cdk-lib/aws-dynamodb";
import { EventBus, Rule } from "aws-cdk-lib/aws-events";
import { LambdaFunction } from "aws-cdk-lib/aws-events-targets";
import { Construct } from "constructs";

import { getCertificateArn } from "../../cdk-helpers/certificates";
import { WEBHOOK_EVENT_BUS_NAME } from "../../constants";
import { ReviewLambda } from "../../functions/review-lambda/config";
import { RoutingLambda } from "../../functions/routing-lambda/config";
import {
  buildResourceName,
  getDomainName,
} from "../../helpers";
import { OrionApi } from "../constructs/api-gateway";

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
    const reviewEventRule = new Rule(this, "WebhookEventRule", {
      eventBus: eventBus,
      eventPattern: {
        detailType: ["GithubPullRequestEvent"],
      },
    });
    // Add the Lambda function as a target for the EventBridge rule
    reviewEventRule.addTarget(new LambdaFunction(reviewLambda));
  }
}
