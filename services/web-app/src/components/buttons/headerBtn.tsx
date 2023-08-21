import React from "react";
import Link from "next/link";

interface HeaderButtonProps {
  text: string;
  route: string;
}

const HeaderButton: React.FC<HeaderButtonProps> = ({ text, route }) => {
  return (
    <Link
      href={route}
    >
      <a className="p-[5px] mx-3 text-l font-mono hover:underline">
        {text}
      </a>    </Link>
  );
};

export default HeaderButton;
