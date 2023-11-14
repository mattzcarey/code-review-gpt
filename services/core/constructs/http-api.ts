import { CorsHttpMethod, HttpApi } from "@aws-cdk/aws-apigatewayv2-alpha";
import { Construct } from "constructs";

import { buildResourceName } from "../env-helpers";

export class WebhookApi extends HttpApi {
  constructor(scope: Construct, id: string) {
    super(scope, id, {
      apiName: buildResourceName(id),
      corsPreflight: {
        allowHeaders: [
          "Content-Type",
          "X-Amz-Date",
          "Authorization",
          "X-Api-Key",
          "X-GitHub-Event",
          "X-GitHub-Delivery",
          "X-Hub-Signature-256",
          "X-Hub-Signature",
        ],
        allowMethods: [CorsHttpMethod.POST],
        allowOrigins: ["*"],
      },
    });
  }
}
