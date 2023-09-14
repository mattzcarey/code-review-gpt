/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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
import { createPullRequestEvent } from "../utils/createEvents";

type WebhookApiResponse = {
  statusCode: number;
  body?: string;
};

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

  // const pr = jsonBody["pull_request"];
  // console.log("pull requests: ", pr);
  // console.log(pr["head"]["sha"]); //the most recent commit sha
  // console.log(pr["base"]["sha"]); //the commit sha of most recent on main

  try {
    // Create an EventBridge Client
    const eventBridgeClient = new EventBridgeClient();

    //Create event based on GithubEvent header
    let event;
    switch (githubEventHeader) {
      case "pull_request":
        event = createPullRequestEvent("detail");
        break;
      default: //todo think of something better here
        return {
          statusCode: 403,
          body: JSON.stringify({ error: "Bad Request" }),
        };
    }

    // Add the event to the EventBridge event bus
    await eventBridgeClient.send(new PutEventsCommand(event));

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
