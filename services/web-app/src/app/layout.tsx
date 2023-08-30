import "../styles/globals.css";
import React, { ReactNode } from "react";
import { NextAuthProvider } from "./providers";
import { Footer } from "@/components/footer/footer";
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";
import { NavBar } from "@/components/navbar";

export const metadata = {
  title: "Code Review GPT",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <script
          type="module"
          src="https://md-block.verou.me/md-block.js"
        ></script>
      </head>
      <body className="flex flex-col min-h-screen">
        <Theme appearance="light" accentColor="purple" grayColor="gray" radius="medium" scaling="95%">
          <NextAuthProvider>
            <NavBar />
            <main className="flex flex-col flex-grow mb-16">{children}</main>
            <Footer />
          </NextAuthProvider>
        </Theme>
      </body>
    </html>
  );
}
