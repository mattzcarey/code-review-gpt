"use client";
import Loading from "@/app/components/loading/loading";
import { RepoTable } from "@/app/components/tables/repoTable";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import useAxios from "../pages/api/useAxios";
import { GET_USER_PATH } from "../lib/constants";
import { HttpMethod } from "../lib/types";

export default function Profile(): JSX.Element {
  const repos = [
    "code-review-gpt",
    "cooking-website",
    "make-money-fast-crypto",
  ];

  const { data: session, status } = useSession();
  const { data, loading, error } = useAxios({
    method: HttpMethod.GET,
    path: GET_USER_PATH,
  });
  console.log(data);
  console.log(loading);
  console.log(error);

  if (status === "loading") {
    return <Loading />;
  }

  if (!session) {
    return (
      <>
        <p className="text-xl flex justify-center mt-16 ml-10">
          You are not logged in.
        </p>
        <Link
          className="text-xl underline flex justify-center mb-5 ml-10"
          href="/"
        >
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
      <div className="flex flex-col p-5 mx-10">
        <div className="flex items-center mb-10">
          <div className="rounded-full overflow-hidden w-16 h-16">
            <Image
              src="/../assets/icon.png"
              alt={"orion logo"}
              width={100}
              height={100}
            />
          </div>
          <h1 className="text-2xl ml-5">{session.user?.email}</h1>
        </div>
        <RepoTable repos={repos} />
      </div>
    </>
  );
}
