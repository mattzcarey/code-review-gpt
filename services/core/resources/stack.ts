import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { LambdaIntegration } from "aws-cdk-lib/aws-apigateway";
import { Table } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";

import { getDomainName } from "../cdk-helpers";
import { getCertificateArn } from "../cdk-helpers/certificates";
import { DDBTable } from "../constructs";
import { CRGPTApi } from "../constructs/api-gateway";
import { WebhookLambda } from "../functions/webhook/config";

interface WebhookStackProps extends StackProps {
  stage: string;
}

export class WebhookStack extends Stack {
  table: Table;
  constructor(scope: Construct, id: string, props: WebhookStackProps) {
    super(scope, id, props);

    //API
    const api = new CRGPTApi(this, "crgpt-api", {
      rootDomain: getDomainName(props.stage),
      subDomain: "crgpt",
      certificateArn: getCertificateArn(this, "crgpt"),
    });

    //DynamoDB
    this.table = new DDBTable(this, "crgpt-table");

    // Lambda
    const webhookLambda = new WebhookLambda(this, "webhook-lambda");

    //Routes
    const webhookRoute = api.root.addResource("/api/github/webhooks");
    webhookRoute.addMethod("POST", new LambdaIntegration(webhookLambda));

    //Exports
    new CfnOutput(this, "webhookUrl", {
      value: api.url,
      exportName: `${props.stage}WebhookUrl`,
    });
  }
}
