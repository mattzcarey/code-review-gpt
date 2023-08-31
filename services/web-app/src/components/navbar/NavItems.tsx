"use client";
import { useSession } from "next-auth/react";
import { signOut, signIn } from "next-auth/react";
import IconButton from "../buttons/iconButton";
import BasicButton from "../buttons/basicButton";
import { HomeIcon, PersonIcon } from "@radix-ui/react-icons";
import React, { Dispatch, HTMLAttributes, SetStateAction } from "react";
import { classNames } from "@/lib/helpers/utils";

interface NavItemsProps extends HTMLAttributes<HTMLUListElement> {
  setOpen?: Dispatch<SetStateAction<boolean>>;
}

export const NavItems = ({
  className,
  setOpen,
  ...props
}: NavItemsProps): JSX.Element => {
  const { data: session } = useSession();
  const loggedIn = session?.user !== undefined;

  return (
    <ul
      className={classNames(
        "flex flex-row items-center gap-4 text-sm flex-1",
        className
      )}
      {...props}
    >
      <div className="flex sm:flex-1 sm:justify-end flex-col items-center justify-center sm:flex-row gap-5 sm:gap-2">
        {loggedIn ? (
          <>
            <IconButton
              icon={<HomeIcon height={20} width={20} />}
              to="/"
              setOpen={setOpen}
            />
            <IconButton
              icon={<PersonIcon height={20} width={20} />}
              to="/profile"
              setOpen={setOpen}
            />

            <BasicButton
              text="Sign Out"
              onClick={() => {
                signOut({ callbackUrl: "/" });
              }}
            />
          </>
        ) : (
          <>
            <IconButton
              icon={<HomeIcon height={20} width={20} />}
              to="/"
              setOpen={setOpen}
            />
            <BasicButton
              text="Sign In"
              onClick={() => {
                signIn("github", { callbackUrl: "/profile" });
              }}
            />
          </>
        )}
      </div>
    </ul>
  );
};
