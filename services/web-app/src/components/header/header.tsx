"use client"
import Image from "next/image";
import OrionLogo from "../../../public/orion.png";
import { LoginButton } from '@/components/buttons/login';

export const Header = (): JSX.Element => {
  return (
    <header className="flex flex-row navbar justify-between items-center">
      <Image src={OrionLogo} alt={"Orion logo"} className="w-[100px]" />
      <h1 className="text-4xl font-mono">
          Code Review GPT
      </h1>
      <LoginButton />
    </header>
  );
};
Header.displayName = 'Header';
export default Header;