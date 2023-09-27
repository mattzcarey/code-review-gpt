import axios, { type AxiosInstance } from "axios";

import { TokenType } from "../utils/types";

const axiosInstance = axios.create({
  baseURL: "https://api.github.com",
});

export const useAxios = (
  tokenType: TokenType,
  token: string
): { axiosInstance: AxiosInstance } => {
  axiosInstance.interceptors.request.clear();
  axiosInstance.interceptors.request.use((config) => {
    config.headers["Authorization"] = `${tokenType} ${token}`;
    config.headers["Accept"] = "application/vnd.github+json";
    config.headers["X-GitHub-Api-Version"] = "2022-11-28";

    return config;
  });

  return { axiosInstance };
};
