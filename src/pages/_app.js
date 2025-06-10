import Head from "next/head";
import { TournamentProvider } from "@/context/TournamentContext";
import "@/styles/globals.css";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>UNO Tournament | Welcome</title>
        <meta
          name="description"
          content="Kelola turnamen UNO Anda dengan mudah"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <TournamentProvider>
        <Component {...pageProps} />
      </TournamentProvider>
    </>
  );
}
