import React from "react";
import useMaintenance from "@/hooks/useMaintenance";
import styles from "@/styles/components/maintenance/MaintenancePage.module.css";

const MaintenancePage = () => {
  const { isLoading } = useMaintenance();

  const maintenanceDetails = [
    { icon: "⏰", text: "Estimasi waktu: 2-4 jam" },
    { icon: "📧", text: "Silakan cek kembali nanti" },
    {
      icon: "🔄",
      text: "Website akan kembali normal setelah maintenance selesai",
    },
    { icon: "⚡", text: "Sistem akan otomatis redirect ke halaman sebelumnya" },
  ];

  const renderContent = (icon, title, description, showDetails = false) => (
    <div className={styles.maintenanceCard}>
      <div className={styles.iconContainer}>
        <div className={styles.maintenanceIcon}>{icon}</div>
      </div>
      <div className={styles.content}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.description}>{description}</p>
        {showDetails && (
          <div className={styles.details}>
            {maintenanceDetails.map((detail, index) => (
              <div key={index} className={styles.detailItem}>
                <span className={styles.detailIcon}>{detail.icon}</span>
                <span>{detail.text}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={styles.maintenanceContainer}>
      {isLoading
        ? renderContent(
            "⏳",
            "Memeriksa Status Sistem",
            "Sedang memeriksa status maintenance..."
          )
        : renderContent(
            "🔧",
            "Website Sedang Dalam Maintenance",
            "Maaf, saat ini website UNO Tournament sedang dalam proses maintenance untuk meningkatkan performa dan fitur-fitur terbaru.",
            true
          )}
    </div>
  );
};

export default MaintenancePage;
