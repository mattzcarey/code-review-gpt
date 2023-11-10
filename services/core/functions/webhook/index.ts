import {
  createLambdaFunction,
  createProbot,
} from "@probot/adapter-aws-lambda-serverless";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";

import { bot } from "./bot";

export const main = (): ((
  event: APIGatewayProxyEvent,
  context: Context
) => Promise<APIGatewayProxyResult>) => {
  return createLambdaFunction(bot, {
    probot: createProbot(),
  });
};
