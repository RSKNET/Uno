import Head from "next/head";
import { TournamentProvider } from "@/context/TournamentContext";
import "@/styles/globals.css";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>UNO Tournament</title>
      </Head>
      <TournamentProvider>
        <Component {...pageProps} />
      </TournamentProvider>
    </>
  );
}
