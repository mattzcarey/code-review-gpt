/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { PutEventsCommandInput } from "@aws-sdk/client-eventbridge/dist-types/commands";

export const createEventParams = (detail: string, detailType: string): PutEventsCommandInput => {
  const eventParams = {
    Entries: [
      {
        Source: "github-webhook.routingLambda",
        Detail: detail,
        DetailType: detailType,
        EventBusName: process.env.EVENT_BUS_NAME,
      },
    ],
  };

  return eventParams;
};