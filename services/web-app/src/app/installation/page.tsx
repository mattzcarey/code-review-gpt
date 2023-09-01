import React from "react";
import ReactMarkdown from "react-markdown";

import { InstallationInstructions } from "../../lib/constants";

export default function Installation(): JSX.Element {
  return (
    <div className="flex flex-col p-5 mx-10">
      <ReactMarkdown className="markdown" children={InstallationInstructions} />
    </div>
  );
}
