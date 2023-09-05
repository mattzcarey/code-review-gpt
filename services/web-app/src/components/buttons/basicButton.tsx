import React, { forwardRef } from "react";
export interface ButtonProps {
  text: string;
  onClick?: () => void;
  styling?: string;
}
const BasicButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ text, onClick, styling }, ref) => {
    return (
      <button
        ref={ref}
        className={`bg-black text-white sm:font-light font-extralight py-2 px-4 rounded ${
          styling ?? ""
        }`}
        onClick={onClick}
      >
        {text}
      </button>
    );
  }
);
export default BasicButton;