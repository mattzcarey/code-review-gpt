import axios, { AxiosInstance } from "axios";
import { BASE_URL } from "@/lib/constants";
import { getSession } from "next-auth/react";
import { Session } from 'next-auth';

const axiosInstance = axios.create({
  baseURL: `${BASE_URL}`,
});

const useAxios = (): { axiosInstance: AxiosInstance } => {
  const session = getSession();
  axiosInstance.interceptors.request.clear();
  axiosInstance.interceptors.request.use(
    (config) => {
      config.headers.Authorization = (session as unknown as Session).token;
      return config;
    }
  );
  return { axiosInstance };
};

export default useAxios;
