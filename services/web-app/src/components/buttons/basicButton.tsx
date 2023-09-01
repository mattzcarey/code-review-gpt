import React from "react";

export interface ButtonProps {
  text: string;
  onClick?: () => void;
}

const BasicButton: React.FC<ButtonProps> = ({ text, onClick }) => {
  return (
    <button
      className="bg-black text-white sm:font-light font-extralight py-2 px-4 rounded"
      onClick={onClick}
    >
      {text}
    </button>
  );
};

export default BasicButton;
