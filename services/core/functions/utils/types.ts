import { EventBridgeEvent } from "aws-lambda";

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

export type GetFilesWithChangesArgs = {
  eventDetail: PullRequestEventDetail;
  appId: string;
  clientSecret: string;
  clientId: string;
  privateKey: string;
  installationId: number;
};

export type ReviewEvent = EventBridgeEvent<"WebhookRequestEvent", string>;

export type JWTPayload = {
  iat: number;
  exp: number;
  iss: string;
  alg: string;
};

export enum TokenType {
  Bearer = "Bearer",
  Token = "token",
}

/** Webhook Object Validation */
type BranchObject = {
  label: string;
};
type OwnerObject = { login: string };
type RepoObject = {
  name: string;
  owner: OwnerObject;
};
type InstallationObject = { id: number };

export type PullRequestEventDetail = {
  pull_request: {
    diff_url: string;
    base: BranchObject;
    head: BranchObject;
  };
  repository: RepoObject;
  installation: InstallationObject;
};

export type ValidFileObject = {
  filename: string;
  raw_url: string;
  patch: string;
};

export type ValidCompareCommitResponse = {
  files: [
    {
      filename: string;
      raw_url: string;
      patch: string;
    }
  ];
};

const isValidObject = (entry: unknown): entry is object => {
  const result = typeof entry === "object" && entry !== null;

  return result;
};

const isValidString = (entry: unknown): entry is object => {
  const result = typeof entry === "string" && entry !== "";

  return result;
};

const isBranchObject = (entry: object): entry is BranchObject => {
  const result = "label" in entry && typeof entry.label === "string";

  return result;
};

const isUserObject = (entry: object): entry is OwnerObject => {
  const result = "login" in entry && typeof entry.login === "string";

  return result;
};

const isRepoObject = (entry: object): entry is RepoObject => {
  const result = "name" in entry && typeof entry.name === "string";

  return result;
};
// eslint-disable-next-line complexity
export const isValidEventDetail = (
  input: unknown
): input is PullRequestEventDetail => {
  const isValid =
    isValidObject(input) &&
    "pull_request" in input &&
    isValidObject(input.pull_request) &&
    "diff_url" in input.pull_request &&
    isValidString(input.pull_request.diff_url) &&
    "base" in input.pull_request &&
    isValidObject(input.pull_request.base) &&
    isBranchObject(input.pull_request.base) &&
    "head" in input.pull_request &&
    isValidObject(input.pull_request.head) &&
    isBranchObject(input.pull_request.head) &&
    "user" in input.pull_request &&
    isValidObject(input.pull_request.user) &&
    isUserObject(input.pull_request.user) &&
    "repository" in input &&
    isValidObject(input.repository) &&
    isRepoObject(input.repository);

  return isValid;
};

export const isValidCompareCommitsResponse = (
  input: unknown
): input is ValidCompareCommitResponse => {
  if (
    !isValidObject(input) ||
    !("files" in input) ||
    !Array.isArray(input.files)
  ) {
    return false;
  }

  for (const file of input.files) {
    if (!isValidFileObject(file)) {
      return false;
    }
  }

  return true;
};

const isValidFileObject = (file: unknown): file is ValidFileObject => {
  return (
    isValidObject(file) &&
    "filename" in file &&
    typeof file.filename === "string" &&
    "raw_url" in file &&
    typeof file.raw_url === "string" &&
    "patch" in file &&
    typeof file.patch === "string"
  );
};


// Installation Access Token Object Validation
type AccessTokenObject = {
  token: string;
};

const isAccessTokenObject = (entry: object): entry is AccessTokenObject => {
  const result = "token" in entry && typeof entry.token === "string";

  return result;
};

// eslint-disable-next-line complexity
export const isValidAccessTokenObject = (
  input: unknown
): input is AccessTokenObject => {
  const isValid =
    isValidObject(input) &&
    isAccessTokenObject(input);

  return isValid;
};
