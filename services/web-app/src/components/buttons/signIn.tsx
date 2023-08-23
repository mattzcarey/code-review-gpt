import { signIn } from 'next-auth/react';

export const SignInButton = () => {
return (
  <button className="border-2 p-[5px] mx-3 text-xl hover:underline" onClick={() => { signIn("github") }}>
    Sign In
  </button>
  )
};
