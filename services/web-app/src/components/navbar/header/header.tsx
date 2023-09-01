"use client";
import { motion } from "framer-motion";
import React from "react";

import { useHeader } from "../../../lib/hooks/useHeader";

export const Header = ({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element => {
  const { hidden } = useHeader();

  return (
    <motion.header
      animate={{
        y: hidden ? "-100%" : "0%",
        transition: { ease: "circOut" },
      }}
      className="sticky top-0 w-full border-b border-b-black/10 dark:border-b-white/25 bg-white dark:bg-black z-20"
    >
      <nav className="max-w-screen-2xl mx-auto py-1 flex items-center justify-between gap-8">
        {children}
      </nav>
    </motion.header>
  );
};
