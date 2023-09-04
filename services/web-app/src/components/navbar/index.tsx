"use client";
import React from "react";

import Logo from "./Logo";
import { MobileMenu } from "./MobileMenu";
import { NavItems } from "./NavItems";
import { Header } from "./header/header";

export const NavBar = (): JSX.Element => {
  return (
    <Header>
      <Logo />
      <NavItems className="hidden sm:flex text-white" />
      <MobileMenu />
    </Header>
  );
};
