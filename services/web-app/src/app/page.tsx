import { InstallationInstructions } from './constants';
import ReactMarkdown from 'react-markdown';

export default function Home() {
  return (
    <>
      <div className="flex flex-col p-5 ml-10 mr-10">
        <ReactMarkdown className="markdown" children={InstallationInstructions} />
      </div>
    </>
  )
}
