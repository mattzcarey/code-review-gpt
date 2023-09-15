import {
  EventBridgeClient,
  PutEventsCommand,
} from "@aws-sdk/client-eventbridge";
import { APIGatewayProxyEvent } from "aws-lambda";

import { authenticate } from "./auth";
import {
  GITHUB_EVENT_HEADER_KEY,
  GITHUB_SIGNATURE_HEADER_KEY,
} from "../../constants";
import { createEventParams } from "../utils/createEventParams";
import { WebhookApiResponse } from "../utils/types";

export const main = async (
  event: APIGatewayProxyEvent
): Promise<WebhookApiResponse> => {
  if (event.body === null) {
    return {
      statusCode: 400,
      body: "The request does not contain a body as expected.",
    };
  }

  const header = event.headers[GITHUB_SIGNATURE_HEADER_KEY];
  const githubEventHeader = event.headers[GITHUB_EVENT_HEADER_KEY];
  if (header === undefined || githubEventHeader === undefined) {
    return {
      statusCode: 401,
      body: `Required headers not found. ${GITHUB_SIGNATURE_HEADER_KEY} and/or ${GITHUB_EVENT_HEADER_KEY}.`,
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

    // Create and route events
    let eventParams;
    switch (githubEventHeader) {
      case "pull_request":
        eventParams = createEventParams(event.body, "GithubPullRequestEvent");
        break;
      default:
        return {
          statusCode: 400,
          body: JSON.stringify({ error: "Unknown Github Event" }),
        };
    }

    // Add event to the EventBridge event bus
    await eventBridgeClient.send(new PutEventsCommand(eventParams));

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
