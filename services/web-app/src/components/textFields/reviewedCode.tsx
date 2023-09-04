import React from "react";

type ReviewedCodeProps = {
  text: string;
  isHidden: boolean;
}

const ReviewedCode = ({ text, isHidden }: ReviewedCodeProps): JSX.Element => {
  if (isHidden || text.length === 0) {
    return <></>;
  }

  return (
    <textarea 
      className="bg-black placeholder-white font-mono p-3 w-[60%] text-md text-white rounded-lg border-2 border-black" 
      rows={10}
      readOnly={true}
      value={text}
    />
  );
};

export default ReviewedCode;