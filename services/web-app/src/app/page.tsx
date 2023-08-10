import { LoginButton } from '@/components/buttons/login';
import { useSession } from 'next-auth/react';

export default function Home() {
  return (
    <>
      <div className="flex flex-col items-center p-5">
        Hello
      </div>
    </>
  )
}
