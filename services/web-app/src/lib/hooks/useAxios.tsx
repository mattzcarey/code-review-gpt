import axios, { AxiosInstance } from "axios";
import { BASE_URL } from "@/lib/constants";
import { getSession } from "next-auth/react";
import { Session } from 'next-auth';

const axiosInstance = axios.create({
  baseURL: `${BASE_URL}`,
});

const useAxios = async (): Promise<{ axiosInstance: AxiosInstance }> => {
  const session = await getSession();
  axiosInstance.interceptors.request.clear();
  console.log("token")
  console.log(session?.token);
  console.log((session as Session))
  console.log((session as Session).token)
  console.log((session as Session).expires)
  console.log((session as Session).user?.name)
  axiosInstance.interceptors.request.use(
    (config) => {
      config.headers["Authorization"] = `Bearer ${session?.token ?? ""}`;
      return config;
    }
  );
  return { axiosInstance };
};

export default useAxios;
