"use client";
import NavBar from "../navbar/navbar";

export const Header = (): JSX.Element => {
  return (
    <header className="w-full">
      <NavBar></NavBar>
    </header>
  );
};

Header.displayName = "Header";
export default Header;
