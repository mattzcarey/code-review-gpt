"use client";
import { Loading } from "@/components/loading/loading";
import { RepoTable } from "@/components/tables/repoTable";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

export default function Profile(): JSX.Element {
  const repos = [
    "code-review-gpt",
    "cooking-website",
    "make-money-fast-crypto",
  ];

  const { data: session, status } = useSession();

  if (status === "loading") {
    return <Loading />;
  }

  if (!session || session === null) {
    return (
      <>
      <p  className="text-xl flex justify-center mt-16 ml-10" >You are not logged in.</p>
      <Link className="text-xl underline flex justify-center mb-5 ml-10" href="/">
        Click here to return to home page. 
      </Link>
      </>
    );
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
