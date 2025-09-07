import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import Loading from "@/components/ui/Loading";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { useApi } from "@/hooks/useApi";
import styles from "@/styles/components/admin/Settings.module.css";

const Settings = ({ showNotification }) => {
  const { fetchSettings: fetchSettingsApi, updateSettings } = useApi();

  const [settingsState, setSettingsState] = useState({
    general: { maintenanceMode: false },
    tournament: {
      maxPlayers: 10,
      defaultRounds: 40,
      allowUnlimitedRounds: true,
    },
  });

  const [loadingState, setLoadingState] = useState({
    isSaving: false,
    isResetModalOpen: false,
  });

  const apiRef = useRef();
  const updateRef = useRef();
  const notificationRef = useRef();

  apiRef.current = fetchSettingsApi;
  updateRef.current = updateSettings;
  notificationRef.current = showNotification;

  const defaultSettings = useMemo(
    () => ({
      maxPlayers: 10,
      rounds: 40,
      unlimited: true,
      maintenance: false,
    }),
    []
  );

  const fetchSettings = useCallback(async () => {
    try {
      const result = await apiRef.current();
      if (result.success) {
        const data = result.data;
        setSettingsState({
          tournament: {
            maxPlayers: data.maxPlayers,
            defaultRounds: data.rounds,
            allowUnlimitedRounds: data.unlimited,
          },
          general: { maintenanceMode: data.maintenance },
        });
      } else {
        notificationRef.current(
          result.error || "Gagal mengambil data settings",
          "error"
        );
      }
    } catch (error) {
      if (error.message !== "Unauthorized") {
        notificationRef.current(
          "Terjadi kesalahan saat mengambil data settings",
          "error"
        );
      }
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleTournamentChange = useCallback((field, value) => {
    if (field === "maxPlayers" && value < 2) {
      notificationRef.current("Max pemain minimal 2", "error");
      return;
    }
    if (field === "defaultRounds" && value < 1) {
      notificationRef.current("Default rounds minimal 1", "error");
      return;
    }
    setSettingsState((prev) => ({
      ...prev,
      tournament: { ...prev.tournament, [field]: value },
    }));
  }, []);

  const handleGeneralChange = useCallback((field, value) => {
    setSettingsState((prev) => ({
      ...prev,
      general: { ...prev.general, [field]: value },
    }));
  }, []);

  const executeSettingsUpdate = useCallback(
    async (requestData, successMessage, errorMessage) => {
      try {
        const result = await updateRef.current(requestData);
        if (result.success) {
          notificationRef.current(successMessage, "success");
          return true;
        } else {
          notificationRef.current(result.error || errorMessage, "error");
          return false;
        }
      } catch (error) {
        if (error.message !== "Unauthorized") {
          notificationRef.current(errorMessage, "error");
        }
        return false;
      }
    },
    []
  );

  const handleSaveSettings = useCallback(async () => {
    setLoadingState((prev) => ({ ...prev, isSaving: true }));

    const requestData = {
      maxPlayers: settingsState.tournament.maxPlayers,
      rounds: settingsState.tournament.defaultRounds,
      unlimited: settingsState.tournament.allowUnlimitedRounds,
      maintenance: settingsState.general.maintenanceMode,
    };

    await executeSettingsUpdate(
      requestData,
      "Pengaturan berhasil disimpan!",
      "Gagal menyimpan pengaturan"
    );

    setLoadingState((prev) => ({ ...prev, isSaving: false }));
  }, [settingsState, executeSettingsUpdate]);

  const handleResetDefaults = useCallback(async () => {
    const success = await executeSettingsUpdate(
      defaultSettings,
      "Pengaturan berhasil direset ke default!",
      "Gagal reset pengaturan"
    );

    if (success) {
      setSettingsState({
        tournament: {
          maxPlayers: defaultSettings.maxPlayers,
          defaultRounds: defaultSettings.rounds,
          allowUnlimitedRounds: defaultSettings.unlimited,
        },
        general: { maintenanceMode: defaultSettings.maintenance },
      });
    }

    setLoadingState((prev) => ({ ...prev, isResetModalOpen: false }));
  }, [defaultSettings, executeSettingsUpdate]);

  return (
    <>
      <div className={styles.settingsContainer}>
        <div className={styles.settingsHeader}>
          <h1>Pengaturan Sistem</h1>
          <p>Konfigurasi pengaturan aplikasi</p>
        </div>

        <div className={styles.settingsContent}>
          <div className={styles.settingsSection}>
            <h2>🏆 Pengaturan Tournament</h2>
            <div className={styles.settingsGrid}>
              <div className={styles.inputRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="maxPlayers">
                    Maksimal Pemain per Tournament (minimal 2)
                  </label>
                  <input
                    type="number"
                    id="maxPlayers"
                    min="2"
                    value={settingsState.tournament.maxPlayers}
                    onChange={(e) =>
                      handleTournamentChange(
                        "maxPlayers",
                        parseInt(e.target.value)
                      )
                    }
                    className={styles.settingsInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="defaultRounds">
                    Default Jumlah Babak (minimal 1)
                  </label>
                  <input
                    type="number"
                    id="defaultRounds"
                    min="1"
                    value={settingsState.tournament.defaultRounds}
                    onChange={(e) =>
                      handleTournamentChange(
                        "defaultRounds",
                        parseInt(e.target.value)
                      )
                    }
                    className={styles.settingsInput}
                  />
                </div>
              </div>

              <div className={styles.checkboxRow}>
                <div className={styles.formGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={settingsState.tournament.allowUnlimitedRounds}
                      onChange={(e) =>
                        handleTournamentChange(
                          "allowUnlimitedRounds",
                          e.target.checked
                        )
                      }
                      className={styles.checkbox}
                    />
                    Izinkan Babak Unlimited
                  </label>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={settingsState.general.maintenanceMode}
                      onChange={(e) =>
                        handleGeneralChange("maintenanceMode", e.target.checked)
                      }
                      className={styles.checkbox}
                    />
                    Mode Maintenance
                  </label>
                  <p className={styles.helpText}>
                    Aktifkan untuk menutup akses website sementara
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.settingsActions}>
            <button
              onClick={handleSaveSettings}
              disabled={loadingState.isSaving}
              className={styles.saveButton}
            >
              {loadingState.isSaving ? "Menyimpan..." : "💾 Simpan Pengaturan"}
            </button>
            <button
              onClick={() =>
                setLoadingState((prev) => ({ ...prev, isResetModalOpen: true }))
              }
              className={styles.resetButton}
            >
              🔄 Reset ke Default
            </button>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={loadingState.isResetModalOpen}
        title="Reset Pengaturan"
        message="Apakah Anda yakin ingin reset semua pengaturan ke nilai default?"
        confirmText="Ya, Reset"
        cancelText="Batal"
        onConfirm={handleResetDefaults}
        onClose={() =>
          setLoadingState((prev) => ({ ...prev, isResetModalOpen: false }))
        }
        type="warning"
      />

      <Loading
        isVisible={loadingState.isSaving}
        message="Menyimpan pengaturan..."
      />
    </>
  );
};

export default Settings;
