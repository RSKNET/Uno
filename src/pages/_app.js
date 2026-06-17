import Head from "next/head";
import { Geist, Space_Grotesk } from "next/font/google";
import { TournamentProvider } from "@/context/TournamentContext";
import { AuthProvider } from "@/context/AuthContext";
import MaintenanceWrapper from "@/components/maintenance/MaintenanceWrapper";
import PWAInstallPrompt from "@/components/ui/PWAInstallPrompt";
import "@/styles/globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
});

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>UNO Tournament</title>
      </Head>
      <div className={`${geist.variable} ${spaceGrotesk.variable} font-sans`}>
        <AuthProvider>
          <TournamentProvider>
            <MaintenanceWrapper>
              <Component {...pageProps} />
            </MaintenanceWrapper>
            <PWAInstallPrompt />
          </TournamentProvider>
        </AuthProvider>
      </div>
    </>
  );
}
