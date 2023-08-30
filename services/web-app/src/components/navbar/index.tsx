"use client";
import Logo from "./Logo";
import { NavItems } from "./NavItems";
import { MobileMenu } from "./MobileMenu";
import React from "react";
import { Header } from "./header/header";

export const NavBar = (): JSX.Element => {
  return (
    <Header>
      <Logo />
      <NavItems className="hidden sm:flex" />
      <MobileMenu />
    </Header>
  );
};
