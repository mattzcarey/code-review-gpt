import { SessionProvider } from "next-auth/react"
import type { AppProps } from 'next/app'
import "../styles/globals.css";
import React, { ReactNode } from 'react';
import { Session } from 'next-auth';
import { NextAuthProvider } from './providers';

export const metadata = {
  title: 'Code Review GPT',
}

export default function RootLayout({
  children,
  }: {children: ReactNode }) {
  return (
    <html lang="en">
        <body>
          <NextAuthProvider>{children}</NextAuthProvider>
        </body>
    </html>
  )
}
