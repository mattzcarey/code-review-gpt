"use client";
import { useSession } from "next-auth/react";
import React, { useState } from "react";

import BasicButton from "../../components/buttons/basicButton";
import Loading from "../../components/loading/loading";
import CodeTextArea from "../../components/textFields/codeBox";
import ReviewedCode from "../../components/textFields/reviewedCode";

export default function Demo(): JSX.Element {
  const { status } = useSession();
  const [loading ] = useState(false);
  const [passedText, setSyncedText] = useState<string>('');
  const [displayedText, setDisplayedText] = useState<string>('');
  const [isHidden, setIsHidden] = useState<boolean>(true);

  const handleText = (text: string) => {
    setSyncedText(text);
  };

  const onClick = () => {
    setIsHidden(false);
    setDisplayedText(passedText);
  }

  if (status === "loading" || loading) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col items-center">
      <CodeTextArea onTextChange={handleText} />
      <BasicButton text="Review" onClick={onClick} styling="m-2" />
      <ReviewedCode text={displayedText} isHidden={isHidden} />
    </div>
  );
}
