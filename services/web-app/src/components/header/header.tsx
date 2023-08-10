"use client"
import Image from "next/image";
import { LoginButton } from '@/components/buttons/login';

export const Header = (): JSX.Element => {
  return (
    <header className="flex flex-row navbar justify-between items-center">
      <Image src="/icon.png" alt={"orion logo"} width={100} height={100} />
      <h1 className="text-4xl font-mono">
          Code Review GPT
      </h1>
      <LoginButton />
    </header>
  );
};
Header.displayName = 'Header';
export default Header;