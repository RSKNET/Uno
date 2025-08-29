import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import AdminLayout from "@/components/AdminLayout";
import Notification from "@/components/Notification";
import Loading from "@/components/Loading";
import ConfirmationModal from "@/components/ConfirmationModal";
import styles from "@/styles/pages/SettingsPage.module.css";

const SettingsPage = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isSaving, setIsSaving] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const [generalSettings, setGeneralSettings] = useState({
    maintenanceMode: false,
  });

  const [tournamentSettings, setTournamentSettings] = useState({
    maxPlayers: 10,
    defaultRounds: 40,
    allowUnlimitedRounds: true,
  });

  useEffect(() => {
    checkAuthentication();
  }, []);

  const fetchSettings = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      showNotification("Token tidak ditemukan", "error");
      return;
    }

    try {
      const response = await fetch("/api/settings", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        const data = result.data;
        setTournamentSettings({
          maxPlayers: data.maxPlayers,
          defaultRounds: data.rounds,
          allowUnlimitedRounds: data.unlimited,
        });
        setGeneralSettings({
          maintenanceMode: data.maintenance,
        });
      } else {
        showNotification(
          result.error || "Gagal mengambil data settings",
          "error"
        );
      }
    } catch (error) {
      showNotification(
        "Terjadi kesalahan saat mengambil data settings",
        "error"
      );
    }
  };

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
        await fetchSettings();
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

  const handleSaveSettings = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      showNotification("Token tidak ditemukan", "error");
      return;
    }

    setIsSaving(true);

    try {
      const requestBody = {
        action: "update",
        maxPlayers: tournamentSettings.maxPlayers,
        rounds: tournamentSettings.defaultRounds,
        unlimited: tournamentSettings.allowUnlimitedRounds,
        maintenance: generalSettings.maintenanceMode,
      };

      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (result.success) {
        showNotification("Pengaturan berhasil disimpan!", "success");
      } else {
        showNotification(result.error || "Gagal menyimpan pengaturan", "error");
      }
    } catch (error) {
      showNotification("Terjadi kesalahan saat menyimpan pengaturan", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetSettings = () => {
    setIsResetModalOpen(true);
  };

  const handleConfirmReset = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      showNotification("Token tidak ditemukan", "error");
      return;
    }

    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: "reset",
        }),
      });

      const result = await response.json();

      if (result.success) {
        const data = result.data;
        setTournamentSettings({
          maxPlayers: data.maxPlayers,
          defaultRounds: data.rounds,
          allowUnlimitedRounds: data.unlimited,
        });
        setGeneralSettings({
          maintenanceMode: data.maintenance,
        });

        setIsResetModalOpen(false);
        showNotification("Pengaturan berhasil direset ke default!", "success");
      } else {
        showNotification(result.error || "Gagal mereset pengaturan", "error");
      }
    } catch (error) {
      showNotification("Terjadi kesalahan saat mereset pengaturan", "error");
    }
  };

  const handleGeneralChange = (field, value) => {
    setGeneralSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTournamentChange = (field, value) => {
    setTournamentSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
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
        <div className={styles.settingsContainer}>
          <div className={styles.settingsContent}>
            <div className={styles.settingsPanel}>
              <div className={styles.settingsSection}>
                <div className={styles.sectionHeader}>
                  <h2>Pengaturan Sistem</h2>
                  <p>Konfigurasi dasar tournament</p>
                </div>

                <div className={styles.settingsGrid}>
                  <div className={styles.settingItem}>
                    <label>Maksimal Pemain</label>
                    <input
                      type="number"
                      min="2"
                      max="16"
                      value={tournamentSettings.maxPlayers}
                      onChange={(e) =>
                        handleTournamentChange(
                          "maxPlayers",
                          parseInt(e.target.value)
                        )
                      }
                      className={styles.settingInput}
                    />
                  </div>

                  <div className={styles.settingItem}>
                    <label>Default Rounds</label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={tournamentSettings.defaultRounds}
                      onChange={(e) =>
                        handleTournamentChange(
                          "defaultRounds",
                          parseInt(e.target.value)
                        )
                      }
                      className={styles.settingInput}
                    />
                  </div>

                  <div className={styles.settingItem + " " + styles.fullWidth}>
                    <div className={styles.switchContainer}>
                      <label>Izinkan Unlimited Rounds</label>
                      <div className={styles.switchWrapper}>
                        <input
                          type="checkbox"
                          checked={tournamentSettings.allowUnlimitedRounds}
                          onChange={(e) =>
                            handleTournamentChange(
                              "allowUnlimitedRounds",
                              e.target.checked
                            )
                          }
                          className={styles.switch}
                        />
                        <span className={styles.switchLabel}>
                          {tournamentSettings.allowUnlimitedRounds
                            ? "Diizinkan"
                            : "Tidak diizinkan"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.settingItem + " " + styles.fullWidth}>
                    <div className={styles.switchContainer}>
                      <label>Mode Maintenance</label>
                      <div className={styles.switchWrapper}>
                        <input
                          type="checkbox"
                          checked={generalSettings.maintenanceMode}
                          onChange={(e) =>
                            handleGeneralChange(
                              "maintenanceMode",
                              e.target.checked
                            )
                          }
                          className={styles.switch}
                        />
                        <span className={styles.switchLabel}>
                          {generalSettings.maintenanceMode
                            ? "Aktif"
                            : "Non-aktif"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.actionButtons}>
                <button
                  onClick={handleResetSettings}
                  className={styles.resetButton}
                >
                  🔄 Reset ke Default
                </button>
                <button
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className={styles.saveButton}
                >
                  {isSaving ? "💾 Menyimpan..." : "💾 Simpan Pengaturan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>

      {isResetModalOpen && (
        <ConfirmationModal
          isOpen={isResetModalOpen}
          title="Reset Pengaturan"
          message="Apakah Anda yakin ingin mereset pengaturan ke nilai default? Semua perubahan yang belum disimpan akan hilang."
          onConfirm={handleConfirmReset}
          onCancel={() => setIsResetModalOpen(false)}
        />
      )}

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </>
  );
};

export default SettingsPage;
