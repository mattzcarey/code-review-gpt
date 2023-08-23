import axios, { AxiosInstance } from "axios";
import { BASE_URL } from "@/app/lib/constants";

const axiosInstance = axios.create({
  baseURL: `${BASE_URL}`,
});

const useAxios = (): { axiosInstance: AxiosInstance } => {
  return { axiosInstance };
};

export default useAxios;
