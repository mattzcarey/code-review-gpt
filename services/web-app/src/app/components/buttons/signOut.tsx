import { signOut } from 'next-auth/react';

export const SignOutButton = () => {
return (
  <button className="border-2 border-black p-[5px] mr-3 ml-3 text-xl hover:underline" onClick={() => { signOut() }}>
    Sign Out
  </button>
  )
};