import { signOut } from 'next-auth/react';

export const SignOutButton = () => {
return (
  <button className="border-2 border-black p-[5px] text-xl hover:underline" onClick={() => { signOut() }}>
    Sign Out
  </button>
  )
};