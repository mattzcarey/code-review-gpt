import axios, { type AxiosInstance } from "axios";
import { getSession } from "next-auth/react";

import { BASE_URL } from "../constants";

const axiosInstance = axios.create({
  baseURL: `${BASE_URL}`,
});

const useAxios = async (): Promise<{ axiosInstance: AxiosInstance }> => {
  const session = await getSession();

  if (session === null || !('token' in session)) {
    throw new Error(
      "Error: logged in user's session data not fetched correctly."
    );
  }

  axiosInstance.interceptors.request.clear();
  axiosInstance.interceptors.request.use((config) => {
    //TODO: investigate this as the Session type returned from does not seem to contain 'token'
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    config.headers.Authorization = session.token;

    return config;
  });

  return { axiosInstance };
};

export default useAxios;
