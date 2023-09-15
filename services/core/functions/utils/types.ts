export type FormattedHandlerResponse = {
  statusCode: number;
  headers: {
    "Access-Control-Allow-Origin": string;
    "Access-Control-Allow-Credentials": boolean;
  };
  body: string;
};

export type WebhookApiResponse = {
    statusCode: number;
    body?: string;
  };
  
export type ReviewArgs = {
  ci: string | undefined;
  setupTarget: string;
  commentPerFile: boolean;
  model: string;
  reviewType: string;
  org: string | undefined;
  remote: string | undefined;
};

export type ReviewFile = {
  fileName: string;
  fileContent: string;
  changedLines: string;
};
