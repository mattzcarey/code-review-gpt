import { FormattedHandlerResponse } from "./types";

export const formatResponse = (
  response: string,
  code?: number
): FormattedHandlerResponse => {
  return {
    statusCode: code || 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body: JSON.stringify(response),
  };
};
