"use client"
import { useSession, signIn } from 'next-auth/react';

export default function Home() {
  // const { data, status } = useSession();
  // const userEmail = data?.user?.email;

  // if (status === "loading") {
  //   return <p>Hang on there...</p>
  // }

  // if (status === "authenticated") {
  //   return (
  //     <>
  //       <p>Signed in as {userEmail}</p>
  //       <button onClick={() => signOut()}>Sign out</button>
  //       <img src="https://cdn.pixabay.com/photo/2017/08/11/19/36/vw-2632486_1280.png" />
  //     </>
  //   )
  // }

  return (
    <div className="flex flex-col items-center p-16 relative place-items-center">
        <h1 className="pb-[40px] text-4xl font-mono">
          Code Review GPT
        </h1>
        <button className="border-solid border-2 border-white p-[10px] text-3xl duration-500 hover:scale-125 hover:animate-bounce" style={{}} onClick={() => { signIn("github") }}>
          Login
        </button>
    </div>
  )
}
