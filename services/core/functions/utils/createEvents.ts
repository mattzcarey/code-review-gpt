import { PutEventsCommandInput } from "@aws-sdk/client-eventbridge/dist-types/commands";

export const createPullRequestEvent = (detail: string): PutEventsCommandInput => {
  const eventParams = {
    Entries: [
      {
        Source: "github-webhook.routingLambda",
        Detail: detail,
        DetailType: "WebhookRequestEvent",
        EventBusName: process.env.EVENT_BUS_NAME,
      },
    ],
  };

  return eventParams;
};
