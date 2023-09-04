import React from "react";

export interface ButtonProps {
  text: string;
  onClick?: () => void;
  styling?: string;
}

const BasicButton: React.FC<ButtonProps> = ({ text, onClick, styling }) => {
  return (
    <button
      className={`bg-black text-white sm:font-light font-extralight py-2 px-4 rounded ${styling ?? ""}`}
      onClick={onClick}
    >
      {text}
    </button>
  );
};

export default BasicButton;
