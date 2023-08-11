import { signIn } from 'next-auth/react';

export const LoginButton = () => {
return (
  <button className="border-2 p-[5px] text-xl hover:underline" onClick={() => { signIn("github") }}>
    Login
  </button>
)
};