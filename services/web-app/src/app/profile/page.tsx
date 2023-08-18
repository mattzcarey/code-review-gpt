"use client";
import { RepoTable } from "@/components/repoTable";
import { useSession } from "next-auth/react";
import Image from "next/image";

export default function Profile(): JSX.Element {
  const repos = [
    "code-review-gpt",
    "cooking-website",
    "make-money-fast-crypto",
  ];

  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (!session) {
    return <p>You are not logged in.</p>;
  }

  if (session == null) {
    return <p>Unauthorised.</p>;
  }

  return (
    <>
      <h1 className="text-3xl flex justify-right mt-10 mb-5 ml-10">
        My Profile
      </h1>
      <div className="flex flex-col p-5 ml-10 mr-10">
        <div className="flex items-center mb-10">
          <div className="rounded-full overflow-hidden w-16 h-16">
            <Image
              src="/icon.png"
              alt={"orion logo"}
              width={100}
              height={100}
              layout="responsive"
            />
          </div>
          <h1 className="text-2xl ml-5">{session.user?.email}</h1>
        </div>
        <RepoTable repos={repos} />
      </div>
    </>
  );
}
