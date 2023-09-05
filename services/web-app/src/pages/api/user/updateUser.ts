import { type AxiosInstance } from "axios";

import { UpdateUserProps } from "../../../lib/types";

export const updateUser = async (
  userUpdatableProps: UpdateUserProps,
  axiosInstance: AxiosInstance
): Promise<void> =>
  axiosInstance.post(`/updateUser`, userUpdatableProps);