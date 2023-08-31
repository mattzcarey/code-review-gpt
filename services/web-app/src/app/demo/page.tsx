"use client";
import { useSession } from "next-auth/react";
import React, { useState } from "react";
import Loading from "@/components/loading/loading";
import CodeTextArea from "@/components/textFields/codeBox";
import ReviewedCode from "@/components/textFields/reviewedCode";
import ReviewButton from "@/components/buttons/reviewBtn";

export default function Demo(): JSX.Element {
  const { status } = useSession();
  const [loading ] = useState(false);
  const [passedText, setSyncedText] = useState<string>('');
  const [isHidden, setIsHidden] = useState<boolean>(true);

  const handleText = (text: string) => {
    setSyncedText(text);
  };

  const onClick = () => {
    setIsHidden(false);
  }

  if (status === "loading" || loading) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col items-center">
      <CodeTextArea onTextChange={handleText} />
      <ReviewButton onClick={onClick} />
      <ReviewedCode text={passedText} isHidden={isHidden} />
    </div>
  );
}
