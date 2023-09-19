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

export type GetFilesWithChangesProps = {
  eventDetail: ValidEventDetail,
  appId: string;
  clientSecret: string;
  clientId: string;
  privateKey: string;
  installationId: number;
}
// Review Lambda
export type ReviewEvent = EventBridgeEvent<"WebhookRequestEvent", string>;

type ShaObject = { sha: string };
type UserObject = { login: string };
type RepoObject = { name: string };
type InstallationObject = {id: number}

type ValidEventDetail = {
  pull_request: { 
    diff_url: string
    base: ShaObject; 
    head: ShaObject; 
    user: UserObject;
  };
  repository: RepoObject; 
  installation: InstallationObject;
};

type ValidCompareCommitResponse = {
  files: [{
    filename:  string,
    contents_url: string
  }]
}

const isValidObject = (entry: unknown): entry is object => {
  const result = typeof entry === "object" && entry !== null;
  console.log("isValidObject:", result);

  return result;
};

const isValidString = (entry: unknown): entry is object => {
  const result = typeof entry === "string" && entry !== "";
  console.log("isValidString:", result);

  return result;
};

const isShaObject = (entry: object): entry is ShaObject => {
  const result = "sha" in entry && typeof entry.sha === "string";
  console.log("isShaObject:", result);

  return result;
};

const isUserObject = (entry: object): entry is ShaObject => {
  const result = "login" in entry && typeof entry.login === "string";
  console.log("isUserObject:", result);

  return result;
};

const isRepoObject = (entry: object): entry is ShaObject => {
  const result = "name" in entry && typeof entry.name === "string";
  console.log("isUserObject:", result);

  return result;
};
// eslint-disable-next-line complexity
export const isValidEventDetail = (
  input: unknown
): input is ValidEventDetail => {
  const isValid =
    isValidObject(input) &&
    "pull_request" in input &&
    isValidObject(input.pull_request) &&
    "diff_url" in input.pull_request &&
    isValidString(input.pull_request.diff_url) &&
    "base" in input.pull_request &&
    isValidObject(input.pull_request.base) &&
    isShaObject(input.pull_request.base) &&
    "head" in input.pull_request &&
    isValidObject(input.pull_request.head) &&
    isShaObject(input.pull_request.head) &&
    "user" in input.pull_request &&
    isValidObject(input.pull_request.user) &&
    isUserObject(input.pull_request.user) &&
    "repository" in input &&
    isValidObject(input.repository) &&
    isRepoObject(input.repository);


  return isValid;
};

export const isValidCompareCommitsResponse = (input: unknown): input is ValidCompareCommitResponse => {
  if (!isValidObject(input) || !("files" in input) || !Array.isArray(input.files)) {
    return false;
  }

  for (const file of input.files) {
    if (!isValidFileObject(file)) {
      return false;
    }
  }

  return true;
}

const isValidFileObject = (file: unknown): file is { filename: string, contents_url: string } => {
  return (
    isValidObject(file) &&
    "filename" in file &&
    typeof file.filename === "string" &&
    "contents_url" in file &&
    typeof file.contents_url === "string"
  );
};