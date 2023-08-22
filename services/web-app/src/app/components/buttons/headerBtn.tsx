import React from "react";
import Link from "next/link";

interface HeaderButtonProps {
  text: string;
  route: string;
}

const HeaderButton: React.FC<HeaderButtonProps> = ({ text, route }) => {
  return (
    <Link
      className="p-[5px] mx-3 text-l font-mono hover:underline"
      href={route}
      className="p-[5px] mx-3 text-l font-mono hover:underline"
    >
      {text}
    </Link>
  );
};

export default HeaderButton;
