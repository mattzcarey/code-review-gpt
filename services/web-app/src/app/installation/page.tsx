import ReactMarkdown from "react-markdown";

import { InstallationInstructions } from "../../lib/installation";

export default function Installation(): JSX.Element {
  return (
    <div className="flex flex-col p-5 mx-10">
      <ReactMarkdown className="markdown" children={InstallationInstructions} />
    </div>
  );
}
