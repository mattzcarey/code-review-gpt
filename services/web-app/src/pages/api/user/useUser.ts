import { getUser } from "./getUser";
import { updateUser } from "./updateUser";
import { useAxios } from "../../../lib/hooks/useAxios";
import { GetUserProps, UpdateUserProps } from "../../../lib/types";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useUser = async () => {
  const { axiosInstance } = await useAxios();

  return {
    updateUser: async (
      updateUserProps: UpdateUserProps
    ) => await updateUser(updateUserProps, axiosInstance),
    getUser: async (getUserProps: GetUserProps) => await getUser(getUserProps, axiosInstance),
  };
};