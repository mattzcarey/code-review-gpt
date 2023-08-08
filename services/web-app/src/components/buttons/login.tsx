import { signIn } from 'next-auth/react';

export const LoginButton = () => {
return (
  <button className="border-solid border-2 border-white p-[5px] text-xl duration-500 hover:scale-125" onClick={() => { signIn("github") }}>
    Login
  </button>
)
};