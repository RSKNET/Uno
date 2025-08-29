import React from "react";
import useMaintenance from "@/hooks/useMaintenance";
import styles from "@/styles/pages/MaintenancePage.module.css";

const MaintenancePage = () => {
  const { isLoading } = useMaintenance();

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.body}>
          <div className={styles.maintenanceContainer}>
            <div className={styles.maintenanceCard}>
              <div className={styles.iconContainer}>
                <div className={styles.maintenanceIcon}>⏳</div>
              </div>
              <div className={styles.content}>
                <h1 className={styles.title}>Memeriksa Status Sistem</h1>
                <p className={styles.description}>
                  Sedang memeriksa status maintenance...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.body}>
        <div className={styles.maintenanceContainer}>
          <div className={styles.maintenanceCard}>
            <div className={styles.iconContainer}>
              <div className={styles.maintenanceIcon}>🔧</div>
            </div>

            <div className={styles.content}>
              <h1 className={styles.title}>Website Sedang Dalam Maintenance</h1>

              <p className={styles.description}>
                Maaf, saat ini website UNO Tournament sedang dalam proses
                maintenance untuk meningkatkan performa dan fitur-fitur terbaru.
              </p>

              <div className={styles.details}>
                <div className={styles.detailItem}>
                  <span className={styles.detailIcon}>⏰</span>
                  <span>Estimasi waktu: 2-4 jam</span>
                </div>

                <div className={styles.detailItem}>
                  <span className={styles.detailIcon}>📧</span>
                  <span>Silakan cek kembali nanti</span>
                </div>

                <div className={styles.detailItem}>
                  <span className={styles.detailIcon}>🔄</span>
                  <span>
                    Website akan kembali normal setelah maintenance selesai
                  </span>
                </div>

                <div className={styles.detailItem}>
                  <span className={styles.detailIcon}>⚡</span>
                  <span>
                    Sistem akan otomatis redirect ke halaman sebelumnya
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;
