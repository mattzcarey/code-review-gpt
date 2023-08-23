import axios, { AxiosInstance } from "axios";
import { BASE_URL } from "@/lib/constants";

const axiosInstance = axios.create({
  baseURL: `${BASE_URL}`,
});

const useAxios = (): { axiosInstance: AxiosInstance } => {
  return { axiosInstance };
};

export default useAxios;
