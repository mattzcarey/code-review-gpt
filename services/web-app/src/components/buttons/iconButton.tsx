import Link from "next/link";
import React, { Dispatch, SetStateAction } from "react";

interface HeaderButtonProps {
  icon: JSX.Element;
  to: string;
  setOpen?: Dispatch<SetStateAction<boolean>>;
}

const IconButton: React.FC<HeaderButtonProps> = ({ icon, to, setOpen }) => {
  return (
    <li className="group relative">
      <Link
        className="p-1 sm:mx-10 justify-right"
        onClick={() => setOpen && setOpen(false)}
        href={to}
      >
        {icon}
      </Link>
      <hr className="absolute top-full border border-transparent border-b-primary dark:border-b-white scale-x-0 group-hover:scale-x-100 group-focus-within:scale-x-100 transition-transform" />
    </li>
  );
};

export default IconButton;
