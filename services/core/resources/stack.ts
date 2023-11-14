import { HttpMethod } from "@aws-cdk/aws-apigatewayv2-alpha";
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";

import { WebhookLambda } from "../constructs/webhook-lambda";
import { WebhookApi } from "../constructs";

interface WebhookStackProps extends StackProps {
  stage: string;
}

export class WebhookStack extends Stack {
  constructor(scope: Construct, id: string, props: WebhookStackProps) {
    super(scope, id, props);

    //API
    const api = new WebhookApi(this, "webhook-api");

    // Lambda
    const webhookLambda = new WebhookLambda(this, "webhook-lambda");

    //Routes
    api.addRoutes({
      path: "/api/github/webhooks",
      methods: [HttpMethod.POST],
      integration: new HttpLambdaIntegration("webhook-lambda", webhookLambda),
    });

    // Exports
    new CfnOutput(this, "webhook-api-url", {
      value: api.apiEndpoint,
    });

    console.log("Test");
  }
}
