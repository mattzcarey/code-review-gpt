"use client";
import { useSession } from "next-auth/react";
import Logo from "../logo/logo";
import { signOut, signIn } from "next-auth/react";
import HeaderButton from "./headerButton";
import BasicButton from "../../buttons/basicButton";
import React from "react";

export const Header = (): JSX.Element => {
  const { data: session } = useSession();

  return (
    <header className="flex flex-row navbar justify-between items-center m-5 border-b border-gray-300  pb-2">
      <Logo />
      <div className="flex items-center">
        {session ? (
          <div className="flex items-center">
            <HeaderButton text="Profile" route="/profile" />
            <div className="flex flex-col">
              <BasicButton
                text="Sign Out"
                onClick={() => {
                  signOut({callbackUrl: "/"});
                }}
              />
            </div>
          </div>
        ) : (
          <BasicButton
            text="Sign In"
            onClick={() => {
              signIn("github", {callbackUrl: "/profile"});
            }}
          />
        )}
      </div>
    </header>
  );
};

Header.displayName = "Header";
export default Header;
