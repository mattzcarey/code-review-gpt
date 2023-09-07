"use client";
import {
  HomeIcon,
  Pencil1Icon,
  PersonIcon,
  RocketIcon,
} from "@radix-ui/react-icons";
import { signIn, signOut, useSession } from "next-auth/react";
import { Dispatch, HTMLAttributes, SetStateAction } from "react";

import { classNames } from "../../lib/helpers/utils";
import BasicButton from "../buttons/basicButton";
import IconButton from "../buttons/iconButton";

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
              icon={<RocketIcon height={20} width={20} />}
              to="/installation"
              setOpen={setOpen}
            />
            <IconButton
              icon={<Pencil1Icon height={20} width={20} />}
              to="/demo"
              setOpen={setOpen}
            />
            <IconButton
              icon={<PersonIcon height={20} width={20} />}
              to="/profile"
              setOpen={setOpen}
            />

            <BasicButton
              text="Sign Out"
              onClick={async () => {
                await signOut({ callbackUrl: "/" });
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
            <IconButton
              icon={<RocketIcon height={20} width={20} />}
              to="/installation"
              setOpen={setOpen}
            />
            <IconButton
              icon={<Pencil1Icon height={20} width={20} />}
              to="/demo"
              setOpen={setOpen}
            />
            <BasicButton
              text="Sign In"
              onClick={async () => {
                await signIn("github", { callbackUrl: "/profile" });
              }}
            />
          </>
        )}
      </div>
    </ul>
  );
};
