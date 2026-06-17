import React, { useState, useEffect, useCallback } from "react";
import Loading from "@/components/ui/Loading";
import { useApi } from "@/hooks/useApi";
import styles from "@/styles/components/admin/Dashboard.module.css";

const Dashboard = ({ onNavigate, showNotification }) => {
  const { fetchPlayers } = useApi();
  const [loadingState, setLoadingState] = useState({
    isLoading: false,
    message: "",
  });
  const [dashboardData, setDashboardData] = useState({
    recentPlayers: [],
  });

  const updateLoadingState = useCallback((updates) => {
    setLoadingState((prev) => ({ ...prev, ...updates }));
  }, []);

  const quickActions = [
    {
      icon: "P",
      title: "Kelola Pemain",
      desc: "Tambah, edit, atau hapus pemain",
      action: () => onNavigate("players"),
    },
    {
      icon: "S",
      title: "Pengaturan",
      desc: "Konfigurasi sistem",
      action: () => onNavigate("settings"),
    },
  ];

  const systemInfo = [
    {
      label: "Status Server:",
      value: "Online",
      className: styles.statusOnline,
    },
    { label: "Database:", value: "Connected", className: styles.statusOnline },
    { label: "Last Update:", value: new Date().toLocaleDateString("id-ID") },
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = useCallback(async () => {
    updateLoadingState({
      isLoading: true,
      message: "Memuat data dashboard...",
    });
    try {
      const result = await fetchPlayers();

      if (result.success) {
        const sortedPlayers = [...result.data].sort(
          (a, b) => new Date(b.joinDate) - new Date(a.joinDate)
        );
        setDashboardData({
          recentPlayers: sortedPlayers.slice(0, 5),
        });
      } else {
        showNotification(
          result.error || "Gagal memuat data dashboard",
          "error"
        );
      }
    } catch (error) {
      if (error.message !== "Unauthorized") {
        showNotification("Terjadi kesalahan saat memuat data", "error");
      }
    } finally {
      updateLoadingState({ isLoading: false, message: "" });
    }
  }, [fetchPlayers, showNotification, updateLoadingState]);

  const renderRecentPlayers = () => (
    <div className={`${styles.contentCardWrapper} double-bezel`} style={{ gridColumn: 'span 2' }}>
      <div className={`${styles.contentCard} double-bezel-inner`}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Pemain Terbaru</h2>
          <button
            className={styles.viewAllBtn}
            onClick={() => onNavigate("players")}
          >
            Lihat Semua
          </button>
        </div>
        <div className={styles.cardContent}>
          {dashboardData.recentPlayers.length > 0 ? (
            <div className={styles.playersList}>
              {dashboardData.recentPlayers.map((player) => (
                <div key={player.id} className={styles.playerItem}>
                  <div className={styles.playerInfo}>
                    <span className={styles.playerName}>{player.name}</span>
                    <span className={styles.playerDate}>
                      {new Date(player.joinDate).toLocaleDateString("id-ID")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <p>Belum ada pemain terdaftar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderQuickActions = () => (
    <div className={`${styles.contentCardWrapper} double-bezel`}>
      <div className={`${styles.contentCard} double-bezel-inner`}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Aksi Cepat</h2>
        </div>
        <div className={styles.cardContent}>
          <div className={styles.actionsList}>
            {quickActions.map((action, index) => (
              <button
                key={index}
                className={styles.actionBtn}
                onClick={action.action}
              >
                <span className={styles.actionIcon}>{action.icon}</span>
                <div className={styles.actionText}>
                  <p className={styles.actionTitle}>{action.title}</p>
                  <p className={styles.actionDesc}>{action.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSystemInfo = () => (
    <div className={`${styles.contentCardWrapper} double-bezel`} style={{ gridColumn: 'span 3' }}>
      <div className={`${styles.contentCard} double-bezel-inner`}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Informasi Sistem</h2>
        </div>
        <div className={styles.cardContent}>
          <div className={styles.systemInfo}>
            {systemInfo.map((info, index) => (
              <div key={index} className={styles.infoItem}>
                <span className={styles.infoLabel}>{info.label}</span>
                <span className={`${styles.infoValue} ${info.className || ""}`}>
                  {info.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className={styles.dashboardContainer}>
        <div className={styles.dashboardHeader}>
          <h1>Dashboard Admin</h1>
          <p>Selamat datang di panel admin UNO Tournament</p>
        </div>

        <div className={styles.dashboardContent}>
          {renderRecentPlayers()}
          {renderQuickActions()}
          {renderSystemInfo()}
        </div>
      </div>
      <Loading
        isVisible={loadingState.isLoading}
        message={loadingState.message}
      />
    </>
  );
};

export default Dashboard;
