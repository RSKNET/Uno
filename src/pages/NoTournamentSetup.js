import React from "react";
import { useRouter } from "next/router";
import useMaintenance from "@/hooks/useMaintenance";
import styles from "@/styles/pages/NoTournamentSetup.module.css";

const NoTournamentSetup = () => {
  const router = useRouter();

  const { isLoading: isMaintenanceLoading } = useMaintenance();

  const handleGoToSetup = () => {
    router.push("/");
  };

  if (isMaintenanceLoading) {
    return (
      <div className={styles.noTournamentMessage}>
        <h2>Memeriksa Status Sistem</h2>
        <p>Sedang memeriksa status maintenance...</p>
      </div>
    );
  }

  return (
    <div className={styles.noTournamentMessage}>
      <h2>Tournament belum di-setup</h2>
      <p>Silakan setup tournament terlebih dahulu.</p>
      <button className={styles.setupButton} onClick={handleGoToSetup}>
        Setup Tournament
      </button>
    </div>
  );
};

export default NoTournamentSetup;
