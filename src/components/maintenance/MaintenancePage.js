import React, { useMemo } from "react";
import useMaintenance from "@/hooks/useMaintenance";
import styles from "@/styles/components/maintenance/MaintenancePage.module.css";

const IconStatus = ({ isLoading }) => (
  <div className={styles.iconWrapper}>
    <div className={styles.iconGlow} />
    {isLoading ? (
      <svg className={styles.spinner} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" className={styles.spinnerTrack} />
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={styles.spinnerHead} />
      </svg>
    ) : (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    )}
  </div>
);

const MaintenancePage = () => {
  const { isLoading } = useMaintenance();

  const maintenanceDetails = useMemo(() => [
    { label: "Durasi", value: "Estimasi 2-4 jam" },
    { label: "Status", value: "Peningkatan Sistem" },
    { label: "Dampak", value: "Akses website ditangguhkan" },
  ], []);

  return (
    <div className={styles.container}>
      <div className={styles.ambientLight} />
      <div className={styles.gridOverlay} />
      
      <div className={styles.content}>
        <IconStatus isLoading={isLoading} />
        
        <div className={styles.textStack}>
          <h1 className={styles.title}>
            {isLoading ? "System Check" : "System Upgrade"}
          </h1>
          <p className={styles.description}>
            {isLoading 
              ? "Memeriksa status ketersediaan sistem, mohon tunggu sebentar..." 
              : "UNO Tournament sedang dalam mode pemeliharaan untuk mengoptimalkan infrastruktur dan menghadirkan fitur-fitur baru."}
          </p>
        </div>

        {!isLoading && (
          <div className={styles.detailsCard}>
            {maintenanceDetails.map((detail, idx) => (
              <div key={idx} className={styles.detailRow}>
                <span className={styles.detailLabel}>{detail.label}</span>
                <span className={styles.detailValue}>{detail.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MaintenancePage;
