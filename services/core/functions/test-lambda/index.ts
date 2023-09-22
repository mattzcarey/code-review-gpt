/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import axios, { type AxiosInstance } from "axios";
import { sign } from "jsonwebtoken";

import { review } from "../../../../code-review-gpt/src/review";
import {
  isValidCompareCommitsResponse,
  isValidEventDetail,
  ReviewEvent,
  ReviewFile,
  ValidFileObject,
} from "../utils/types";

export const main = async (event: ReviewEvent): Promise<void> => {
  console.log(event.detail);
  const eventDetail = event.detail;
  console.log(eventDetail);
  if (!isValidEventDetail(eventDetail)) {
    throw new Error(
      "Error fetching event in review-lambda event is of an unexpected shape"
    );
  }
  const now = Math.floor(Date.now() / 1000); // Get current Unix timestamp in seconds
  const iat = now - 60; // Issued at time, 60 seconds in the past
  const exp = now + 10 * 60; // JWT expiration time (10 minutes in the future)
  const iss = "390085"; // GitHub App's identifier

  // Create the JWT payload
  const payload = {
    iat,
    exp,
    iss,
    alg: "RS256",
    // Add any other claims or data you need in the token
  };

  console.log(payload);
  // Your JWT secret key (keep this secret and don't hardcode it in your code)
  const secretKey = "secretkey - get me from param store";
  const token = sign(payload, secretKey, { algorithm: "RS256" });
  console.log(token);

  const installationId = eventDetail.installation.id;

  const axiosInstance = axios.create({
    baseURL: "https://api.github.com",
  });
  const useAxiosInstallation = (): { axiosInstance: AxiosInstance } => {
    axiosInstance.interceptors.request.clear();
    axiosInstance.interceptors.request.use((config) => {
      config.headers["Authorization"] = `Bearer ${token}`;
      config.headers["Accept"] = "application/vnd.github+json";
      config.headers["X-GitHub-Api-Version"] = "2022-11-28";

      return config;
    });

    return { axiosInstance };
  };
  const accessTokenResponse = await useAxiosInstallation().axiosInstance.post(
    `/app/installations/${installationId}/access_tokens`,
    {
      repository: "github-app-webhook-test",
    }
  );

  console.log(accessTokenResponse.data);

  const useAxios = (): { axiosInstance: AxiosInstance } => {
    axiosInstance.interceptors.request.clear();
    axiosInstance.interceptors.request.use((config) => {
      config.headers["Authorization"] = `token ${
        accessTokenResponse.data.token as string
      }`;
      config.headers["Accept"] = "application/vnd.github+json";
      config.headers["X-GitHub-Api-Version"] = "2022-11-28";

      return config;
    });

    return { axiosInstance };
  };

  let response = await useAxios().axiosInstance.get("/meta");
  console.log("Meta");

  console.log(response);
  response = await useAxios().axiosInstance.get(
    "/repos/OrionTools/github-app-webhook-test/commits"
  );
  console.log("getcommit");

  console.log(response);

  response = await useAxios().axiosInstance.get(
    `/repos/OrionTools/github-app-webhook-test/compare/OrionTools:main...OrionTools:subtract`
  );
  console.log("compare");

  console.log(response.data);

  // Do logic:
  const args = {
    model: "gpt-3.5",
    reviewType: "changed",
    setupTarget: "github",
    ci: undefined,
    org: undefined,
    commentPerFile: false,
    remote: undefined,
    _: [],
    $0: "",
  };

  if (isValidCompareCommitsResponse(response.data)) {
    const reviewFiles: ReviewFile[] = await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      response.data.files.map(async (file: ValidFileObject) => {
        const fileName = file.filename;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const fileContent = (await axios.get(file.raw_url)).data;
        console.log(fileContent);
        const changedLines = getChangedFileLines(file.patch);
        console.log(changedLines);

        return { fileName, fileContent, changedLines };
      })
    );

    console.log(reviewFiles);
    //todo get user open-ai-api-key from dynamodb
    await review(args, reviewFiles, "open-ai-api-key");
  }
};

export const getChangedFileLines = (patch: string): string => {
  const changedLines = patch
    .split("\n")
    .filter((line) => line.startsWith("+") || line.startsWith("-"))
    .filter((line) => !line.startsWith("---") && !line.startsWith("+++"))
    .join("\n");

  return changedLines;
};
