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
      className="p-[14px] mx-2 text-l font-light hover:underline"
    >
      {text}
    </Link>
  );
};

export default HeaderButton;
