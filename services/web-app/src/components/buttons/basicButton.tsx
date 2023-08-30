import React from "react";
import { Button } from "@radix-ui/themes";

export interface UpdateAPIKeyProps {
  text: string;
  onClick?: () => void;
}

const BasicButton: React.FC<UpdateAPIKeyProps> = ({ text, onClick }) => {
  return (
    <button
      className="bg-black hover:bg-purple-900 text-white sm:font-light font-extralight py-2 px-4 rounded"
      onClick={onClick}
    >
      {text}
    </button>
  );
};

export default BasicButton;
