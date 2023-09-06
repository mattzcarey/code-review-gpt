import { getUser } from "./getUser";
import { updateUser } from "./updateUser";
import { useAxios } from "../../../lib/hooks/useAxios";
import {
  GetUserProps,
  UpdateUserProps,
  UseUserApiResponse,
} from "../../../lib/types";

export const useUserApi = (): UseUserApiResponse => {
  const { axiosInstance } = useAxios();

  return {
    updateUser: async (updateUserProps: UpdateUserProps) =>
      await updateUser(updateUserProps, axiosInstance),
    getUser: async (getUserProps: GetUserProps) =>
      await getUser(getUserProps, axiosInstance),
  };
};
