import React, { useState } from "react";

interface CodeBoxProps {
  onTextChange: (text: string) => void;
}

const CodeBox = ({ onTextChange }: CodeBoxProps): JSX.Element => {
  const [inputText, setInputText] = useState('');
  
  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(event.target.value);
    onTextChange(event.target.value);
  };

  return (
    <>
      <textarea 
        className="bg-black font-mono p-3 mt-5 w-[60%] text-md text-white rounded-lg border-2 border-black" 
        placeholder="Enter your code here..." 
        rows={10}
        onChange={handleInputChange}
        value={inputText}
      />
    </>
  );
};

export default CodeBox;