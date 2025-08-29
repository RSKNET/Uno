import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import AdminLayout from "@/components/AdminLayout";
import Notification from "@/components/Notification";
import Loading from "@/components/Loading";
import styles from "@/styles/pages/Dashboard.module.css";

const Dashboard = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    totalPlayers: 0,
    totalTournaments: 0,
    activeTournaments: 0,
    recentPlayers: [],
  });

  useEffect(() => {
    checkAuthentication();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated]);

  const checkAuthentication = async () => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      showNotification(
        "Akses ditolak. Silakan login terlebih dahulu.",
        "error"
      );
      router.push("/login");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/verify-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        showNotification("Session expired. Silakan login kembali.", "error");
        router.push("/login");
      }
    } catch (error) {
      showNotification("Terjadi kesalahan. Silakan coba lagi.", "error");
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    setIsLoadingData(true);
    try {
      const playersResponse = await fetch("/api/players");
      const playersResult = await playersResponse.json();

      if (playersResult.success) {
        const players = playersResult.data;
        setDashboardData((prev) => ({
          ...prev,
          totalPlayers: players.length,
          recentPlayers: players.slice(-5).reverse(),
        }));
      }
    } catch (error) {
    } finally {
      setIsLoadingData(false);
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleLogout = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      showNotification("Token tidak ditemukan", "error");
      router.push("/login");
      return;
    }

    try {
      const response = await fetch("/api/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        showNotification("Logout berhasil", "success");
        router.push("/login");
      } else {
        showNotification(data.error || "Gagal logout", "error");
      }
    } catch (error) {
      showNotification("Terjadi kesalahan saat logout", "error");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push("/login");
    }
  };

  const navigateToPlayers = () => {
    router.push("/admin/players");
  };

  const navigateToSettings = () => {
    router.push("/admin/settings");
  };

  if (isLoading) {
    return <Loading isVisible={true} message="Memverifikasi autentikasi..." />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <AdminLayout user={user} onLogout={handleLogout}>
        <div className={styles.dashboardContainer}>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>👥</div>
              <div className={styles.statContent}>
                <h3 className={styles.statNumber}>
                  {dashboardData.totalPlayers}
                </h3>
                <p className={styles.statLabel}>Total Pemain</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>🏆</div>
              <div className={styles.statContent}>
                <h3 className={styles.statNumber}>
                  {dashboardData.totalTournaments}
                </h3>
                <p className={styles.statLabel}>Total Turnamen</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>🎮</div>
              <div className={styles.statContent}>
                <h3 className={styles.statNumber}>
                  {dashboardData.activeTournaments}
                </h3>
                <p className={styles.statLabel}>Turnamen Aktif</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>📊</div>
              <div className={styles.statContent}>
                <h3 className={styles.statNumber}>100%</h3>
                <p className={styles.statLabel}>System Status</p>
              </div>
            </div>
          </div>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Pemain Terbaru</h2>
                <button
                  className={styles.viewAllBtn}
                  onClick={navigateToPlayers}
                >
                  Lihat Semua
                </button>
              </div>
              <div className={styles.cardContent}>
                {dashboardData.recentPlayers.length > 0 ? (
                  <div className={styles.playersList}>
                    {dashboardData.recentPlayers.map((player, index) => (
                      <div
                        key={player.id || index}
                        className={styles.playerItem}
                      >
                        <div className={styles.playerAvatar}>
                          {player.name?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <div className={styles.playerInfo}>
                          <p className={styles.playerName}>{player.name}</p>
                          <p className={styles.playerDate}>
                            {new Date(
                              player.created_at || Date.now()
                            ).toLocaleDateString("id-ID")}
                          </p>
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

            <div className={styles.contentCard}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Aksi Cepat</h2>
              </div>
              <div className={styles.cardContent}>
                <div className={styles.actionsList}>
                  <button
                    className={styles.actionBtn}
                    onClick={navigateToPlayers}
                  >
                    <span className={styles.actionIcon}>👥</span>
                    <div className={styles.actionText}>
                      <p className={styles.actionTitle}>Kelola Pemain</p>
                      <p className={styles.actionDesc}>
                        Tambah, edit, atau hapus pemain
                      </p>
                    </div>
                  </button>

                  <button
                    className={styles.actionBtn}
                    onClick={navigateToSettings}
                  >
                    <span className={styles.actionIcon}>⚙️</span>
                    <div className={styles.actionText}>
                      <p className={styles.actionTitle}>Pengaturan</p>
                      <p className={styles.actionDesc}>Konfigurasi sistem</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.contentCard}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Informasi Sistem</h2>
              </div>
              <div className={styles.cardContent}>
                <div className={styles.systemInfo}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Status Server:</span>
                    <span
                      className={styles.infoValue + " " + styles.statusOnline}
                    >
                      Online
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Database:</span>
                    <span
                      className={styles.infoValue + " " + styles.statusOnline}
                    >
                      Connected
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Last Update:</span>
                    <span className={styles.infoValue}>
                      {new Date().toLocaleDateString("id-ID")}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Version:</span>
                    <span className={styles.infoValue}>1.0.0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      <Loading isVisible={isLoadingData} message="Memuat data dashboard..." />
    </>
  );
};

export default Dashboard;
