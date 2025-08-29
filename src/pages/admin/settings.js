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

  const [activeTab, setActiveTab] = useState("general");
  const [isSaving, setIsSaving] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const [generalSettings, setGeneralSettings] = useState({
    siteName: "UNO Tournament System",
    adminEmail: "admin@unotournament.com",
    timezone: "Asia/Jakarta",
    language: "id",
    maintenanceMode: false,
    registrationEnabled: true,
  });

  const [tournamentSettings, setTournamentSettings] = useState({
    maxPlayers: 8,
    defaultRounds: 5,
    allowUnlimitedRounds: true,
    autoSaveResults: true,
    enablePlayerStats: true,
    tournamentTimer: 30,
  });

  const [emailSettings, setEmailSettings] = useState({
    smtpHost: "smtp.gmail.com",
    smtpPort: 587,
    smtpUsername: "",
    smtpPassword: "",
    fromEmail: "noreply@unotournament.com",
    fromName: "UNO Tournament",
    enableNotifications: true,
  });

  const [securitySettings, setSecuritySettings] = useState({
    sessionTimeout: 24,
    passwordMinLength: 8,
    requireUppercase: true,
    requireNumbers: true,
    requireSpecialChars: false,
    maxLoginAttempts: 5,
    enableTwoFactor: false,
  });

  const [backupSettings, setBackupSettings] = useState({
    autoBackup: true,
    backupFrequency: "daily",
    retentionDays: 30,
    backupLocation: "local",
    lastBackup: "2024-08-28T10:30:00Z",
  });

  useEffect(() => {
    checkAuthentication();
  }, []);

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
    setIsSaving(true);
    showNotification("Pengaturan berhasil disimpan!", "success");
    setIsSaving(false);
  };

  const handleResetSettings = () => {
    setIsResetModalOpen(true);
  };

  const handleConfirmReset = () => {
    if (activeTab === "general") {
      setGeneralSettings({
        siteName: "UNO Tournament System",
        adminEmail: "admin@unotournament.com",
        timezone: "Asia/Jakarta",
        language: "id",
        maintenanceMode: false,
        registrationEnabled: true,
      });
    } else if (activeTab === "tournament") {
      setTournamentSettings({
        maxPlayers: 8,
        defaultRounds: 5,
        allowUnlimitedRounds: true,
        autoSaveResults: true,
        enablePlayerStats: true,
        tournamentTimer: 30,
      });
    }

    setIsResetModalOpen(false);
    showNotification("Pengaturan berhasil direset ke default!", "success");
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

  const handleEmailChange = (field, value) => {
    setEmailSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSecurityChange = (field, value) => {
    setSecuritySettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBackupChange = (field, value) => {
    setBackupSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const createBackup = () => {
    showNotification("Backup sedang dibuat...", "info");
    setBackupSettings((prev) => ({
      ...prev,
      lastBackup: new Date().toISOString(),
    }));
    showNotification("Backup berhasil dibuat!", "success");
  };

  const tabs = [
    { id: "general", label: "Umum", icon: "⚙️" },
    { id: "tournament", label: "Tournament", icon: "🏆" },
    { id: "email", label: "Email", icon: "📧" },
    { id: "security", label: "Keamanan", icon: "🔒" },
    { id: "backup", label: "Backup", icon: "💾" },
  ];

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
          <div className={styles.header}>
            <h1 className={styles.title}>Pengaturan Sistem</h1>
            <p className={styles.subtitle}>
              Konfigurasi dan manajemen sistem UNO Tournament
            </p>
          </div>

          <div className={styles.settingsContent}>
            <div className={styles.tabsNavigation}>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${styles.tabButton} ${
                    activeTab === tab.id ? styles.activeTab : ""
                  }`}
                >
                  <span className={styles.tabIcon}>{tab.icon}</span>
                  <span className={styles.tabLabel}>{tab.label}</span>
                </button>
              ))}
            </div>

            <div className={styles.settingsPanel}>
              {activeTab === "general" && (
                <div className={styles.settingsSection}>
                  <div className={styles.sectionHeader}>
                    <h2>Pengaturan Umum</h2>
                    <p>Konfigurasi dasar sistem</p>
                  </div>

                  <div className={styles.settingsGrid}>
                    <div className={styles.settingItem}>
                      <label>Nama Situs</label>
                      <input
                        type="text"
                        value={generalSettings.siteName}
                        onChange={(e) =>
                          handleGeneralChange("siteName", e.target.value)
                        }
                        className={styles.settingInput}
                      />
                    </div>

                    <div className={styles.settingItem}>
                      <label>Email Admin</label>
                      <input
                        type="email"
                        value={generalSettings.adminEmail}
                        onChange={(e) =>
                          handleGeneralChange("adminEmail", e.target.value)
                        }
                        className={styles.settingInput}
                      />
                    </div>

                    <div className={styles.settingItem}>
                      <label>Timezone</label>
                      <select
                        value={generalSettings.timezone}
                        onChange={(e) =>
                          handleGeneralChange("timezone", e.target.value)
                        }
                        className={styles.settingSelect}
                      >
                        <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
                        <option value="Asia/Makassar">
                          Asia/Makassar (WITA)
                        </option>
                        <option value="Asia/Jayapura">
                          Asia/Jayapura (WIT)
                        </option>
                      </select>
                    </div>

                    <div className={styles.settingItem}>
                      <label>Bahasa</label>
                      <select
                        value={generalSettings.language}
                        onChange={(e) =>
                          handleGeneralChange("language", e.target.value)
                        }
                        className={styles.settingSelect}
                      >
                        <option value="id">Bahasa Indonesia</option>
                        <option value="en">English</option>
                      </select>
                    </div>

                    <div
                      className={styles.settingItem + " " + styles.fullWidth}
                    >
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

                    <div
                      className={styles.settingItem + " " + styles.fullWidth}
                    >
                      <div className={styles.switchContainer}>
                        <label>Pendaftaran Pemain</label>
                        <div className={styles.switchWrapper}>
                          <input
                            type="checkbox"
                            checked={generalSettings.registrationEnabled}
                            onChange={(e) =>
                              handleGeneralChange(
                                "registrationEnabled",
                                e.target.checked
                              )
                            }
                            className={styles.switch}
                          />
                          <span className={styles.switchLabel}>
                            {generalSettings.registrationEnabled
                              ? "Diizinkan"
                              : "Ditutup"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "tournament" && (
                <div className={styles.settingsSection}>
                  <div className={styles.sectionHeader}>
                    <h2>Pengaturan Tournament</h2>
                    <p>Konfigurasi tournament dan permainan</p>
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

                    <div className={styles.settingItem}>
                      <label>Timer Tournament (menit)</label>
                      <input
                        type="number"
                        min="5"
                        max="120"
                        value={tournamentSettings.tournamentTimer}
                        onChange={(e) =>
                          handleTournamentChange(
                            "tournamentTimer",
                            parseInt(e.target.value)
                          )
                        }
                        className={styles.settingInput}
                      />
                    </div>

                    <div
                      className={styles.settingItem + " " + styles.fullWidth}
                    >
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

                    <div
                      className={styles.settingItem + " " + styles.fullWidth}
                    >
                      <div className={styles.switchContainer}>
                        <label>Auto Save Hasil</label>
                        <div className={styles.switchWrapper}>
                          <input
                            type="checkbox"
                            checked={tournamentSettings.autoSaveResults}
                            onChange={(e) =>
                              handleTournamentChange(
                                "autoSaveResults",
                                e.target.checked
                              )
                            }
                            className={styles.switch}
                          />
                          <span className={styles.switchLabel}>
                            {tournamentSettings.autoSaveResults
                              ? "Aktif"
                              : "Non-aktif"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div
                      className={styles.settingItem + " " + styles.fullWidth}
                    >
                      <div className={styles.switchContainer}>
                        <label>Enable Player Stats</label>
                        <div className={styles.switchWrapper}>
                          <input
                            type="checkbox"
                            checked={tournamentSettings.enablePlayerStats}
                            onChange={(e) =>
                              handleTournamentChange(
                                "enablePlayerStats",
                                e.target.checked
                              )
                            }
                            className={styles.switch}
                          />
                          <span className={styles.switchLabel}>
                            {tournamentSettings.enablePlayerStats
                              ? "Aktif"
                              : "Non-aktif"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "email" && (
                <div className={styles.settingsSection}>
                  <div className={styles.sectionHeader}>
                    <h2>Pengaturan Email</h2>
                    <p>Konfigurasi SMTP dan notifikasi email</p>
                  </div>

                  <div className={styles.settingsGrid}>
                    <div className={styles.settingItem}>
                      <label>SMTP Host</label>
                      <input
                        type="text"
                        value={emailSettings.smtpHost}
                        onChange={(e) =>
                          handleEmailChange("smtpHost", e.target.value)
                        }
                        className={styles.settingInput}
                      />
                    </div>

                    <div className={styles.settingItem}>
                      <label>SMTP Port</label>
                      <input
                        type="number"
                        value={emailSettings.smtpPort}
                        onChange={(e) =>
                          handleEmailChange(
                            "smtpPort",
                            parseInt(e.target.value)
                          )
                        }
                        className={styles.settingInput}
                      />
                    </div>

                    <div className={styles.settingItem}>
                      <label>SMTP Username</label>
                      <input
                        type="text"
                        value={emailSettings.smtpUsername}
                        onChange={(e) =>
                          handleEmailChange("smtpUsername", e.target.value)
                        }
                        className={styles.settingInput}
                      />
                    </div>

                    <div className={styles.settingItem}>
                      <label>SMTP Password</label>
                      <input
                        type="password"
                        value={emailSettings.smtpPassword}
                        onChange={(e) =>
                          handleEmailChange("smtpPassword", e.target.value)
                        }
                        className={styles.settingInput}
                      />
                    </div>

                    <div className={styles.settingItem}>
                      <label>From Email</label>
                      <input
                        type="email"
                        value={emailSettings.fromEmail}
                        onChange={(e) =>
                          handleEmailChange("fromEmail", e.target.value)
                        }
                        className={styles.settingInput}
                      />
                    </div>

                    <div className={styles.settingItem}>
                      <label>From Name</label>
                      <input
                        type="text"
                        value={emailSettings.fromName}
                        onChange={(e) =>
                          handleEmailChange("fromName", e.target.value)
                        }
                        className={styles.settingInput}
                      />
                    </div>

                    <div
                      className={styles.settingItem + " " + styles.fullWidth}
                    >
                      <div className={styles.switchContainer}>
                        <label>Enable Email Notifications</label>
                        <div className={styles.switchWrapper}>
                          <input
                            type="checkbox"
                            checked={emailSettings.enableNotifications}
                            onChange={(e) =>
                              handleEmailChange(
                                "enableNotifications",
                                e.target.checked
                              )
                            }
                            className={styles.switch}
                          />
                          <span className={styles.switchLabel}>
                            {emailSettings.enableNotifications
                              ? "Aktif"
                              : "Non-aktif"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div className={styles.settingsSection}>
                  <div className={styles.sectionHeader}>
                    <h2>Pengaturan Keamanan</h2>
                    <p>Konfigurasi keamanan dan autentikasi</p>
                  </div>

                  <div className={styles.settingsGrid}>
                    <div className={styles.settingItem}>
                      <label>Session Timeout (jam)</label>
                      <input
                        type="number"
                        min="1"
                        max="168"
                        value={securitySettings.sessionTimeout}
                        onChange={(e) =>
                          handleSecurityChange(
                            "sessionTimeout",
                            parseInt(e.target.value)
                          )
                        }
                        className={styles.settingInput}
                      />
                    </div>

                    <div className={styles.settingItem}>
                      <label>Min. Panjang Password</label>
                      <input
                        type="number"
                        min="6"
                        max="20"
                        value={securitySettings.passwordMinLength}
                        onChange={(e) =>
                          handleSecurityChange(
                            "passwordMinLength",
                            parseInt(e.target.value)
                          )
                        }
                        className={styles.settingInput}
                      />
                    </div>

                    <div className={styles.settingItem}>
                      <label>Max. Login Attempts</label>
                      <input
                        type="number"
                        min="3"
                        max="10"
                        value={securitySettings.maxLoginAttempts}
                        onChange={(e) =>
                          handleSecurityChange(
                            "maxLoginAttempts",
                            parseInt(e.target.value)
                          )
                        }
                        className={styles.settingInput}
                      />
                    </div>

                    <div
                      className={styles.settingItem + " " + styles.fullWidth}
                    >
                      <div className={styles.switchContainer}>
                        <label>Require Uppercase</label>
                        <div className={styles.switchWrapper}>
                          <input
                            type="checkbox"
                            checked={securitySettings.requireUppercase}
                            onChange={(e) =>
                              handleSecurityChange(
                                "requireUppercase",
                                e.target.checked
                              )
                            }
                            className={styles.switch}
                          />
                          <span className={styles.switchLabel}>
                            {securitySettings.requireUppercase
                              ? "Wajib"
                              : "Opsional"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div
                      className={styles.settingItem + " " + styles.fullWidth}
                    >
                      <div className={styles.switchContainer}>
                        <label>Require Numbers</label>
                        <div className={styles.switchWrapper}>
                          <input
                            type="checkbox"
                            checked={securitySettings.requireNumbers}
                            onChange={(e) =>
                              handleSecurityChange(
                                "requireNumbers",
                                e.target.checked
                              )
                            }
                            className={styles.switch}
                          />
                          <span className={styles.switchLabel}>
                            {securitySettings.requireNumbers
                              ? "Wajib"
                              : "Opsional"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div
                      className={styles.settingItem + " " + styles.fullWidth}
                    >
                      <div className={styles.switchContainer}>
                        <label>Require Special Characters</label>
                        <div className={styles.switchWrapper}>
                          <input
                            type="checkbox"
                            checked={securitySettings.requireSpecialChars}
                            onChange={(e) =>
                              handleSecurityChange(
                                "requireSpecialChars",
                                e.target.checked
                              )
                            }
                            className={styles.switch}
                          />
                          <span className={styles.switchLabel}>
                            {securitySettings.requireSpecialChars
                              ? "Wajib"
                              : "Opsional"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div
                      className={styles.settingItem + " " + styles.fullWidth}
                    >
                      <div className={styles.switchContainer}>
                        <label>Two-Factor Authentication</label>
                        <div className={styles.switchWrapper}>
                          <input
                            type="checkbox"
                            checked={securitySettings.enableTwoFactor}
                            onChange={(e) =>
                              handleSecurityChange(
                                "enableTwoFactor",
                                e.target.checked
                              )
                            }
                            className={styles.switch}
                          />
                          <span className={styles.switchLabel}>
                            {securitySettings.enableTwoFactor
                              ? "Aktif"
                              : "Non-aktif"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "backup" && (
                <div className={styles.settingsSection}>
                  <div className={styles.sectionHeader}>
                    <h2>Pengaturan Backup</h2>
                    <p>Konfigurasi backup dan restore data</p>
                  </div>

                  <div className={styles.settingsGrid}>
                    <div className={styles.settingItem}>
                      <label>Frekuensi Backup</label>
                      <select
                        value={backupSettings.backupFrequency}
                        onChange={(e) =>
                          handleBackupChange("backupFrequency", e.target.value)
                        }
                        className={styles.settingSelect}
                      >
                        <option value="hourly">Setiap Jam</option>
                        <option value="daily">Harian</option>
                        <option value="weekly">Mingguan</option>
                        <option value="monthly">Bulanan</option>
                      </select>
                    </div>

                    <div className={styles.settingItem}>
                      <label>Retention (hari)</label>
                      <input
                        type="number"
                        min="7"
                        max="365"
                        value={backupSettings.retentionDays}
                        onChange={(e) =>
                          handleBackupChange(
                            "retentionDays",
                            parseInt(e.target.value)
                          )
                        }
                        className={styles.settingInput}
                      />
                    </div>

                    <div className={styles.settingItem}>
                      <label>Lokasi Backup</label>
                      <select
                        value={backupSettings.backupLocation}
                        onChange={(e) =>
                          handleBackupChange("backupLocation", e.target.value)
                        }
                        className={styles.settingSelect}
                      >
                        <option value="local">Local Storage</option>
                        <option value="cloud">Cloud Storage</option>
                        <option value="ftp">FTP Server</option>
                      </select>
                    </div>

                    <div
                      className={styles.settingItem + " " + styles.fullWidth}
                    >
                      <div className={styles.switchContainer}>
                        <label>Auto Backup</label>
                        <div className={styles.switchWrapper}>
                          <input
                            type="checkbox"
                            checked={backupSettings.autoBackup}
                            onChange={(e) =>
                              handleBackupChange("autoBackup", e.target.checked)
                            }
                            className={styles.switch}
                          />
                          <span className={styles.switchLabel}>
                            {backupSettings.autoBackup ? "Aktif" : "Non-aktif"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div
                      className={styles.settingItem + " " + styles.fullWidth}
                    >
                      <div className={styles.backupInfo}>
                        <div className={styles.backupStatus}>
                          <span className={styles.statusLabel}>
                            Last Backup:
                          </span>
                          <span className={styles.statusValue}>
                            {new Date(backupSettings.lastBackup).toLocaleString(
                              "id-ID"
                            )}
                          </span>
                        </div>
                        <button
                          onClick={createBackup}
                          className={styles.backupButton}
                        >
                          🔄 Buat Backup Sekarang
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

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
