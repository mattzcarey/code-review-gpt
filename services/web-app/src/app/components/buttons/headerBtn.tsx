import React from "react";
import Link from "next/link";

interface HeaderButtonProps {
  text: string;
  route: string;
}

const HeaderButton: React.FC<HeaderButtonProps> = ({ text, route }) => {
  return (
    <Link
      className="p-[5px] mr-3 ml-3 text-l font-mono hover:underline"
      href={route}
    >
      {text}
    </Link>
  );
};

export default HeaderButton;
