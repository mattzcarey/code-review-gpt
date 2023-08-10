import "../styles/globals.css";
import React, { ReactNode } from 'react';
import { NextAuthProvider } from './providers';
import { Footer } from '@/components/footer/footer';
import { Header } from '@/components/header/header';

export const metadata = {
  title: 'Code Review GPT',
}

export default function RootLayout({
  children,
  }: {children: ReactNode }) {
  return (
    <html lang="en">
        <body>
          <NextAuthProvider>
            <Header />
            {children}
            <Footer />
          </NextAuthProvider>
        </body>
    </html>
  )
}
