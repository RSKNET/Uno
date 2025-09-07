import { useEffect, useState } from "react";
import { useRouter } from "next/router";

const EXCLUDED_PAGES = ["/", "/GamePage", "/maintenance", "/NoTournamentSetup"];

export const usePWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const router = useRouter();

  const isExcludedPage = EXCLUDED_PAGES.includes(router.pathname);

  useEffect(() => {
    if (isExcludedPage || typeof window === "undefined") return;

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log(
            "Service Worker berhasil didaftarkan:",
            registration.scope
          );
        })
        .catch((error) => {
          console.log("Service Worker gagal didaftarkan:", error);
        });
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [isExcludedPage]);

  const installApp = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  const dismissInstallPrompt = () => {
    setShowInstallPrompt(false);
  };

  return {
    showInstallPrompt: showInstallPrompt && !isExcludedPage,
    installApp,
    dismissInstallPrompt,
    isExcludedPage,
  };
};
