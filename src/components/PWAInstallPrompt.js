import { usePWA } from "@/hooks/usePWA";
import styles from "@/styles/components/PWAInstallPrompt.module.css";
import Image from "next/image";

export default function PWAInstallPrompt() {
  const { showInstallPrompt, installApp, dismissInstallPrompt } = usePWA();

  if (!showInstallPrompt) return null;

  return (
    <div className={styles.promptContainer}>
      <div className={styles.promptContent}>
        <div className={styles.promptIcon}>
          <Image
            src="/android-chrome-192x192.png"
            alt="UNO Tournament Logo"
            width={60}
            height={60}
            className={styles.logoImage}
          />
        </div>
        <div className={styles.promptText}>
          <h3>Install UNO Admin</h3>
          <p>Install aplikasi untuk akses yang lebih mudah dan cepat</p>
        </div>
        <div className={styles.promptActions}>
          <button onClick={installApp} className={styles.installButton}>
            Install
          </button>
          <button
            onClick={dismissInstallPrompt}
            className={styles.dismissButton}
          >
            Nanti
          </button>
        </div>
      </div>
    </div>
  );
}
