import { APIGatewayProxyEvent } from "aws-lambda";
import {
  EventBridgeClient,
  PutEventsCommand,
} from "@aws-sdk/client-eventbridge";
import { GITHUB_SIGNATURE_HEADER_KEY } from "../../constants";
import { authenticate } from "../review-lambda/auth";


export const main = async (event: APIGatewayProxyEvent) => {
  if (event.body === null) {
    return {
      statusCode: 400,
      body: "The request does not contain a body as expected.",
    };
  }

  const header = event.headers[GITHUB_SIGNATURE_HEADER_KEY];
  if (header === undefined) {
    return {
      statusCode: 401,
      body: "No authentication token found.",
    };
  }

  const authenticated = await authenticate(header, event.body);
  if (!authenticated) {
    return {
      statusCode: 401,
      body: "Unauthorized.",
    };
  }

  try {
    // Create an EventBridge Client
    const eventBridgeClient = new EventBridgeClient();

    console.log(process.env.EVENT_BUS_NAME)
    // Create Event
    const eventParams = {
      Entries: [
        {
          Source: "github-webhook.routingLambda",
          Detail: event.body,
          DetailType: "WebhookRequestEvent",
          EventBusName: process.env.EVENT_BUS_NAME,
        },
      ],
    };

    // Add the event to the EventBridge event bus
    await eventBridgeClient.send(
      new PutEventsCommand(eventParams)
    );

    // Return a successful response
    return {
      statusCode: 200,
    };
  } catch (error) {
    console.error("Error handling API Gateway request:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
