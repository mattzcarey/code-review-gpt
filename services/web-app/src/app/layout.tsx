import "../styles/globals.css";
import React, { ReactNode } from "react";
import { NextAuthProvider } from "./providers";
import { Footer } from "@/components/footer/footer";
import { Header } from "@/components/navbar/header/header";
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";

export const metadata = {
  title: "Code Review GPT",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          type="module"
          src="https://md-block.verou.me/md-block.js"
        ></script>
      </head>
      <body className="flex flex-col min-h-screen">
        <Theme appearance="light" accentColor="purple" grayColor="gray" radius="medium" scaling="95%">
          <NextAuthProvider>
            <Header />
            <main className="flex flex-col flex-grow mb-16">{children}</main>
            <Footer />
          </NextAuthProvider>
        </Theme>
      </body>
    </html>
  );
}
