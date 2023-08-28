import { signIn } from "next-auth/react";
import { redirect } from "next/navigation";

export const SignInButton = () => {
  return (
    <button
      className="border-2 p-[5px] mx-3 text-xl hover:underline"
      onClick={() => {
        signIn("github", { callbackUrl: '/profile' });
      }}
    >
      Sign In
    </button>
  );
};
