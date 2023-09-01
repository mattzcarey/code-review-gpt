"use client";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import { ReturnToHome } from "../../components/cards/returnToHome";
import UpdateAPIKey from "../../components/dialog/updateApiKey";
import Loading from "../../components/loading/loading";
import { RepoTable } from "../../components/tables/repoTable";
import useAxios from "../../lib/hooks/useAxios";
import { User } from "../../lib/types";

const containsUserDataFields = (input: object): boolean =>
  "email" in input &&
  typeof input.email === "string" &&
  "userId" in input &&
  typeof input.userId === "string" &&
  "apiKey" in input &&
  typeof input.apiKey === "string" &&
  "name" in input &&
  typeof input.name === "string";

const isValidUserData = (input: unknown): input is User =>
  typeof input === "object" && input !== null && containsUserDataFields(input);

export default async function Profile(): Promise<JSX.Element> {
  let user: User;
  const { data: session, status } = useSession();
  const { axiosInstance } = await useAxios();
  const [data, setData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (
          session === null ||
          session.user === undefined ||
          session.user.id === undefined
        ) {
          throw new Error("Session data not fetched correctly.");
        }
        const response = await axiosInstance.get(
          `/getUser?userId=${session.user.id}`
        );
        //We need response.data to be of type string so that it can be parsed into user data
        if (typeof response.data !== "string") {
          throw new Error("Session data not fetched correctly.");
        }
        setData(response.data);
      } catch (err) {
        console.error("Failed to getUser, due to the following error ", err);
      } finally {
        setLoading(false);
      }
    };
    void fetchData();
  }, [session?.user]);

  if (status === "loading" || loading) {
    return <Loading />;
  }

  if (!session) {
    return <ReturnToHome message="You are not logged in" />;
  }

  if (!data) {
    return <ReturnToHome message="Could not retrieve User data." />;
  } else {
    const parsedData: unknown = JSON.parse(data);
    if (!isValidUserData(parsedData)) {
      return <ReturnToHome message="Could not retrieve valid User data." />;
    } else {
      user = parsedData;
    }
  }

  const handleUpdateApiKey = async (newApiKey: string) => {
    try {
      const response = await axiosInstance.post(`/updateUser`, {
        userID: user.userId,
        apiKey: newApiKey,
      });
      console.log("API key updated successfully:", response.data);
    } catch (error) {
      console.error("Failed to update API key:", error);
    }
  };

  return (
    <>
      <h1 className="text-3xl flex justify-right mt-10 mb-5 ml-10">
        My Profile
      </h1>
      <div className="flex flex-col p-5 mx-10">
        <div className="flex items-center mb-10">
          <div className="rounded-full overflow-hidden w-16 h-16">
            <Image
              src={user.pictureUrl ?? "/user.svg"}
              alt={"orion logo"}
              width={100}
              height={100}
            />
          </div>
          <h1 className="text-2xl ml-5">{user.email}</h1>
        </div>
        <UpdateAPIKey onSave={handleUpdateApiKey} />
        <RepoTable repos={user.repos} />
      </div>
    </>
  );
}
