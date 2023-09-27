import { sign } from "jsonwebtoken";

import { useAxios } from "./useAxios";
import {
  GITHUB_APP_ID_PARAM_NAME,
  GITHUB_APP_PRIVATE_KEY_PARAM_NAME,
  GITHUB_JWT_ALGORITHM,
} from "../../constants";
import { getVariableFromSSM } from "../utils/getVariable";
import {
  isValidAccessTokenObject,
  isValidCompareCommitsResponse,
  JWTPayload,
  PullRequestEventDetail,
  TokenType,
  ValidCompareCommitResponse,
} from "../utils/types";

export const createJWTPayload = (clientId: string): JWTPayload => {
  const now = Math.floor(Date.now() / 1000);
  const iat = now - 60; // Issued at time, 60 seconds in the past
  const exp = now + 10 * 60; // JWT expiration time (10 minutes in the future)
  const iss = clientId;

  return {
    iat,
    exp,
    iss,
    alg: GITHUB_JWT_ALGORITHM,
  };
};

export const getChangedFileLines = (patch: string): string => {
  const changedLines = patch
    .split("\n")
    .filter((line) => line.startsWith("+") || line.startsWith("-"))
    .filter((line) => !line.startsWith("---") && !line.startsWith("+++"))
    .join("\n");

  return changedLines;
};

export const getInstallationAccessToken = async (
  eventDetail: PullRequestEventDetail
): Promise<string> => {
  //Create JWT token
  const privateKey = await getVariableFromSSM(
    GITHUB_APP_PRIVATE_KEY_PARAM_NAME
  );

  //Get client id from SSM
  const clientId = await getVariableFromSSM(GITHUB_APP_ID_PARAM_NAME);

  //Create JWT token
  const token = sign(createJWTPayload(clientId), privateKey, {
    algorithm: "RS256",
  });

  //Get installation id from event
  const installationId = eventDetail.installation.id;

  //Get installation access token from GitHub
  const accessTokenResponse = await useAxios(
    TokenType.Bearer,
    token
  ).axiosInstance.post(`/app/installations/${installationId}/access_tokens`);
  console.log(accessTokenResponse.data);

  if (!isValidAccessTokenObject(accessTokenResponse.data)) {
    throw new Error(
      "Response when retrieving installation access token is of an unexpected shape"
    );
  }

  return accessTokenResponse.data.token;
};

export const getCompareCommitsResponse = async (
  eventDetail: PullRequestEventDetail,
  installationAccessToken: string
): Promise<ValidCompareCommitResponse> => {
  const owner = eventDetail.repository.owner.login;
  const repo = eventDetail.repository.name;
  const base = eventDetail.pull_request.base.label;
  const head = eventDetail.pull_request.head.label;
  const response = await useAxios(
    TokenType.Token,
    installationAccessToken
  ).axiosInstance.get(`/repos/${owner}/${repo}/compare/${base}...${head}`);
  console.log(response.data);

  if (!isValidCompareCommitsResponse(response.data)) {
    throw new Error(
      "Response when comparing commits is of an unexpected shape"
    );
  }

  return response.data;
};
