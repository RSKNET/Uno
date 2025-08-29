import React from "react";
import { useRouter } from "next/router";
import styles from "@/styles/components/NoTournamentSetup.module.css";

const NoTournamentSetup = () => {
  const router = useRouter();

  const handleGoToSetup = () => {
    router.push("/");
  };

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
