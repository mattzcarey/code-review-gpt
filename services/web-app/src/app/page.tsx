import { useSession } from 'next-auth/react';
import { InstallationInstructions } from './installationInstructions';
import ReactMarkdown from 'react-markdown';

export default function Home() {
  return (
    <>
      <div className="flex flex-col p-5 ">
        <ReactMarkdown className="markdown" children={InstallationInstructions} />
      </div>
    </>
  )
}
