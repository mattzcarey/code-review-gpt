/* eslint-disable @typescript-eslint/restrict-template-expressions */
import axios, { type AxiosInstance } from "axios";
import { getSession } from "next-auth/react";

import { BASE_URL } from "../constants";

const axiosInstance = axios.create({
  baseURL: `${BASE_URL}`,
});

export const useAxios = async (): Promise<{ axiosInstance: AxiosInstance }> => {
  const session = await getSession();

  if (session === null || session.token === undefined) {
    throw new Error(
      "Error: logged in user's session data not fetched correctly."
    );
  }

  axiosInstance.interceptors.request.clear();
  axiosInstance.interceptors.request.use(
    (config) => {
        config.headers["Authorization"] = `Bearer ${session.token}`;
      
      return config;
    }
  );

  return { axiosInstance };
};

export default useAxios;
