"use client";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import { ReturnToHome } from "../../components/cards/returnToHome";
import UpdateAPIKey from "../../components/dialog/updateApiKey";
import Loading from "../../components/loading/loading";
import { RepoTable } from "../../components/tables/repoTable";
import { UserBody } from "../../lib/types";
import { useUser } from "../../pages/api/user/useUser";

export default function Profile(): JSX.Element {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<UserBody | null>(null);
  const [loading, setLoading] = useState(false);
  // console.log("before useEffect session -> ", session);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { getUser } = await useUser();
      try {
        if (
          session === null ||
          session.user === undefined ||
          session.user.userId === undefined
        ) {
          throw new Error("Session data not fetched correctly.");
        }
        const userId = session.user.userId;
        const parsedUser = await getUser({userId});
        setUser(parsedUser);

      } catch (err) {
        console.error("Failed to getUser, due to the following error ", err);
      } finally {
        setLoading(false);
      }
    };
    void fetchData();
  }, [session?.user?.userId]);

  // Use useEffect to watch for changes in the user state
  useEffect(() => {
    if (user !== null) {
      return;
    }
  }, [user]);

  if (status === "loading" || loading) {
    return <Loading />;
  }

  if (!session) {
    return <ReturnToHome message="You are not logged in" />;
  }

  // Check this error
  if (!user) {
    return <ReturnToHome message="Could not retrieve User data." />;
  }
  
  const handleUpdateApiKey = async (newApiKey: string) => {
    try {
      const { updateUser } = await useUser();
      await updateUser({
        apiKey: newApiKey,
        userId: user.userId,
      });
      console.log("API key updated successfully");
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
