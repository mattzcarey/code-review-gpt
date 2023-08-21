import { InstallationInstructions } from './constants';
import ReactMarkdown from 'react-markdown';

export default function Home() {
  return (
    <>
      <div className="flex flex-col p-5 mx-10">
        <ReactMarkdown
          className="markdown"
          children={InstallationInstructions}
        />
      </div>
    </>
  )
}
