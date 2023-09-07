export type FormattedHandlerResponse = {
  statusCode: number;
  headers: {
    "Access-Control-Allow-Origin": string;
    "Access-Control-Allow-Credentials": boolean;
  };
  body: string;
};

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
