import axios, { type AxiosInstance } from "axios";

import { BASE_URL } from "../constants";

const axiosInstance = axios.create({
  baseURL: `${BASE_URL}`,
});

export const useAxios = async (): Promise<{ axiosInstance: AxiosInstance }> => {
  return { axiosInstance };
};

export default useAxios;
