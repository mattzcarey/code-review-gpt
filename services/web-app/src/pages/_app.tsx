import { SessionProvider } from "next-auth/react";

export default function App({
  Component,
  pageProps: {session, ...pageProps},
}) {
  return (
    <SessionProvider session={pageProps.session}>
      <Component {...pageProps} />
    </SessionProvider>
  )
}