import "../styles/globals.css";
import React, { ReactNode } from 'react';
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
