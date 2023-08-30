import { signIn } from "next-auth/react";
import { redirect } from "next/navigation";

export const SignInButton = () => {
  return (
    <button
      className="text-base mx-3 text-xl hover:underline"
      onClick={() => {
        signIn("github", { callbackUrl: "/profile" });
      }}
    >
      Sign In
    </button>
  );
};
