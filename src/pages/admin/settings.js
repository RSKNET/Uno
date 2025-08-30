import React, { useState, useEffect, useCallback } from "react";
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

  const [settings, setSettings] = useState({
    general: { maintenanceMode: false },
    tournament: {
      maxPlayers: 10,
      defaultRounds: 40,
      allowUnlimitedRounds: true,
    },
  });

  useEffect(() => {
    checkAuthentication();
  }, []);

  const showNotification = useCallback((message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  }, []);

  const getToken = useCallback(() => localStorage.getItem("token"), []);

  const fetchSettings = useCallback(async () => {
    const token = getToken();
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
        setSettings({
          tournament: {
            maxPlayers: data.maxPlayers,
            defaultRounds: data.rounds,
            allowUnlimitedRounds: data.unlimited,
          },
          general: { maintenanceMode: data.maintenance },
        });
      } else {
        showNotification(
          result.error || "Gagal mengambil data settings",
          "error"
        );
      }
    } catch {
      showNotification(
        "Terjadi kesalahan saat mengambil data settings",
        "error"
      );
    }
  }, [getToken, showNotification]);

  const checkAuthentication = useCallback(async () => {
    const token = getToken();
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
    } catch {
      showNotification("Terjadi kesalahan. Silakan coba lagi.", "error");
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  }, [getToken, showNotification, router, fetchSettings]);

  const handleLogout = useCallback(async () => {
    const token = getToken();
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
    } catch {
      showNotification("Terjadi kesalahan saat logout", "error");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push("/login");
    }
  }, [getToken, showNotification, router]);

  const handleSaveSettings = useCallback(async () => {
    const token = getToken();
    if (!token) {
      showNotification("Token tidak ditemukan", "error");
      return;
    }

    setIsSaving(true);

    try {
      const requestBody = {
        action: "update",
        maxPlayers: settings.tournament.maxPlayers,
        rounds: settings.tournament.defaultRounds,
        unlimited: settings.tournament.allowUnlimitedRounds,
        maintenance: settings.general.maintenanceMode,
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
    } catch {
      showNotification("Terjadi kesalahan saat menyimpan pengaturan", "error");
    } finally {
      setIsSaving(false);
    }
  }, [getToken, settings, showNotification]);

  const handleConfirmReset = useCallback(async () => {
    const token = getToken();
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
        body: JSON.stringify({ action: "reset" }),
      });

      const result = await response.json();

      if (result.success) {
        const data = result.data;
        setSettings({
          tournament: {
            maxPlayers: data.maxPlayers,
            defaultRounds: data.rounds,
            allowUnlimitedRounds: data.unlimited,
          },
          general: { maintenanceMode: data.maintenance },
        });

        setIsResetModalOpen(false);
        showNotification("Pengaturan berhasil direset ke default!", "success");
      } else {
        showNotification(result.error || "Gagal mereset pengaturan", "error");
      }
    } catch {
      showNotification("Terjadi kesalahan saat mereset pengaturan", "error");
    }
  }, [getToken, showNotification]);

  const updateSettings = useCallback((category, field, value) => {
    setSettings((prev) => ({
      ...prev,
      [category]: { ...prev[category], [field]: value },
    }));
  }, []);

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
                      value={settings.tournament.maxPlayers}
                      onChange={(e) =>
                        updateSettings(
                          "tournament",
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
                      value={settings.tournament.defaultRounds}
                      onChange={(e) =>
                        updateSettings(
                          "tournament",
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
                          checked={settings.tournament.allowUnlimitedRounds}
                          onChange={(e) =>
                            updateSettings(
                              "tournament",
                              "allowUnlimitedRounds",
                              e.target.checked
                            )
                          }
                          className={styles.switch}
                        />
                        <span className={styles.switchLabel}>
                          {settings.tournament.allowUnlimitedRounds
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
                          checked={settings.general.maintenanceMode}
                          onChange={(e) =>
                            updateSettings(
                              "general",
                              "maintenanceMode",
                              e.target.checked
                            )
                          }
                          className={styles.switch}
                        />
                        <span className={styles.switchLabel}>
                          {settings.general.maintenanceMode
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
                  onClick={() => setIsResetModalOpen(true)}
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
