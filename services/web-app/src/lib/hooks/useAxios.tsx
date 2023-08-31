import axios, { AxiosInstance } from "axios";
import { Session } from 'next-auth';
import { getSession } from "next-auth/react";

import { BASE_URL } from "@/lib/constants";


const axiosInstance = axios.create({
  baseURL: `${BASE_URL}`,
});

const useAxios = (): { axiosInstance: AxiosInstance } => {
  const session = getSession();
  axiosInstance.interceptors.request.clear();
  axiosInstance.interceptors.request.use(
    (config) => {
      config.headers.Authorization = (session as Session).token;

      return config;
    }
  );

  return { axiosInstance };
};

export default useAxios;
