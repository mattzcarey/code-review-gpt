import { signIn } from 'next-auth/react';

export const SignInButton = () => {
return (
  <button className="border-2 p-[5px] mr-3 ml-3 text-xl hover:underline" onClick={() => { signIn("github") }}>
    Sign In
  </button>
  )
};
