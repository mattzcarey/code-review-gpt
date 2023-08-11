"use client"
import Image from "next/image";
import { SignInButton } from '@/components/buttons/signIn';
import { useSession } from 'next-auth/react';
import { SignOutButton } from '../buttons/signOut';

export const Header = (): JSX.Element => {
  const { data: session } = useSession();

  return (
    <header className="flex flex-row navbar justify-between items-center">
      <Image src="/icon.png" alt={"orion logo"} width={100} height={100} />
      <h1 className="text-4xl font-mono">
          Code Review GPT
      </h1>
      { session ? (
        <div className="flex flex-col">
          {session.user?.email}
          <SignOutButton />
        </div>
      ) : (
        <SignInButton />
      )}
    </header>
  );
};
Header.displayName = 'Header';
export default Header;