"use client"
import { LoginButton } from '@/components/buttons/login';
import { useSession } from 'next-auth/react';
import Image from "next/image";
import GithubImg from "../../public/github-mark-white.svg";
import Footer from '@/components/footer/footer';

export default function Home() {
  const { data, status } = useSession();

  return (
    <>
      <div className="flex flex-col items-center p-5 relative place-items-center">
        <h1 className="pb-[10px] text-4xl font-mono">
          Code Review GPT
        </h1>
        <a href="https://github.com/mattzcarey/code-review-gpt">
          <Image src={GithubImg} alt={"Github logo"} className="p-[10px] w-[60px]" />
        </a>
        {status === "authenticated" ? (
          <h1>You're logged in {data.user?.name}</h1>
        ) : (
          <LoginButton />
        )}
      </div>
      <Footer />
    </>
  )
}
