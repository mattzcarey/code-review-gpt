import { signOut } from "next-auth/react";
import { redirect } from "next/navigation";

export const SignOutButton = () => {
  return (
    <button
      className="border-2 border-black p-[5px] mx-3 text-xl hover:underline"
      onClick={() => {
        signOut({ callbackUrl: "/" });
      }}
    >
      Sign Out
    </button>
  );
};
