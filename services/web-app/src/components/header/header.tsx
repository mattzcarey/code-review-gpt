"use client";
import Image from "next/image";
import { SignInButton } from "@/components/buttons/signIn";
import { useSession } from "next-auth/react";
import { SignOutButton } from "../buttons/signOut";
import HeaderButton from "../buttons/headerBtn";
import Link from "next/link";

export const Header = (): JSX.Element => {
  const { data: session } = useSession();

  return (
    <header className="flex flex-row navbar justify-between items-center m-5">
      <div className="flex items-center">
        <div className="rounded-full overflow-hidden w-16 h-16">
          <Image
            src="/icon.png"
            alt={"orion logo"}
            width={100}
            height={100}
            layout="responsive"
          />
        </div>
        <Link className="text-4xl font-mono ml-4" href="/">
          Code Review GPT
        </Link>
      </div>
      <div className="flex items-center">
        {session ? (
          <div className="flex items-center">
            <HeaderButton text="Profile" route="/profile" />
            <div className="flex flex-col">
              <SignOutButton />
            </div>
          </div>
        ) : (
          <SignInButton />
        )}
      </div>
    </header>
  );
};

Header.displayName = "Header";
export default Header;
