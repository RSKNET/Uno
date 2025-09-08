import Head from "next/head";
import { TournamentProvider } from "@/context/TournamentContext";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { AuthProvider } from "@/context/AuthContext";
import { Analytics } from "@vercel/analytics/next";
import MaintenanceWrapper from "@/components/maintenance/MaintenanceWrapper";
import PWAInstallPrompt from "@/components/ui/PWAInstallPrompt";
import "@/styles/globals.css";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>UNO Tournament</title>
      </Head>
      <AuthProvider>
        <TournamentProvider>
          <MaintenanceWrapper>
            <Component {...pageProps} />
          </MaintenanceWrapper>
          <PWAInstallPrompt />
        </TournamentProvider>
        <Analytics />
        <SpeedInsights />
      </AuthProvider>
    </>
  );
}
