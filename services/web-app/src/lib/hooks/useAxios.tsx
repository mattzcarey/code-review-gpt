import axios, { type AxiosInstance } from "axios";

import { BASE_USER_ENDPOINT } from "../constants";

const axiosInstance = axios.create({
  baseURL: `${BASE_USER_ENDPOINT}`,
});

export const useAxios = (): { axiosInstance: AxiosInstance } => {
  axiosInstance.interceptors.request.clear();
  axiosInstance.interceptors.request.use((config) => {
    config.headers["x-api-key"] = process.env.NEXT_PUBLIC_USER_API_KEY;

    return config;
  });

  return { axiosInstance };
};

export default useAxios;
