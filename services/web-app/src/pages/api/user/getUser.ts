import { type AxiosInstance } from "axios";

import { GetUserProps, UserBody } from "../../../lib/types";

export const getUser = async (
  getUserProps : GetUserProps,
  axiosInstance: AxiosInstance,
): Promise<UserBody> => {
  const { data } = await axiosInstance.get<string>(`/getUser?userId=${getUserProps.userId}`);

  return JSON.parse(data) as UserBody;
};