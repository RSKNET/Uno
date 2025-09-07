import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Navbar from "@/components/layout/Navbar";
import Notification from "@/components/ui/Notification";
import Loading from "@/components/ui/Loading";
import { useTournament } from "@/context/TournamentContext";
import useSettings from "@/hooks/useSettings";
import styles from "@/styles/pages/IndexPage.module.css";

const Index = () => {
  const router = useRouter();
  const { tournamentData, saveTournamentData, resetTournamentData } =
    useTournament();
  const { settings } = useSettings();

  const [formData, setFormData] = useState({
    playerCount: tournamentData.playerCount || 0,
    rounds: tournamentData.rounds || "",
    playerNames: tournamentData.playerNames || [],
  });
  const [notification, setNotification] = useState(null);
  const [loadingState, setLoadingState] = useState({
    isLoading: false,
    message: "",
  });
  const [suggestionState, setSuggestionState] = useState({
    playerSuggestions: [],
    activeSuggestionIndex: -1,
    showSuggestions: {},
  });
  const [formErrors, setFormErrors] = useState({ playerCount: "", rounds: "" });
  const [isFormValid, setIsFormValid] = useState(false);

  const { playerCount, rounds, playerNames } = formData;
  const { isLoading, message: loadingMessage } = loadingState;
  const { playerSuggestions, activeSuggestionIndex, showSuggestions } =
    suggestionState;

  useEffect(() => {
    fetchPlayerSuggestions();
  }, []);

  useEffect(() => {
    if (settings.maxPlayers && playerCount > settings.maxPlayers) {
      updateFormData({
        playerCount: settings.maxPlayers,
        playerNames: Array(settings.maxPlayers).fill(""),
      });
    }
  }, [settings.maxPlayers, playerCount]);

  useEffect(() => {
    validateFormRealtime();
  }, [playerCount, rounds, playerNames, settings]);

  const updateFormData = useCallback((updates) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  const fetchPlayerSuggestions = async () => {
    try {
      const response = await fetch("/api/players");
      if (!response.ok) throw new Error("Failed to fetch players");
      const result = await response.json();
      setSuggestionState((prev) => ({
        ...prev,
        playerSuggestions:
          result.success && result.data
            ? result.data.map((player) => player.name)
            : [],
      }));
    } catch {
      setSuggestionState((prev) => ({ ...prev, playerSuggestions: [] }));
    }
  };

  const validateFormRealtime = useCallback(() => {
    const errors = { playerCount: "", rounds: "" };

    if (playerCount < 2) {
      errors.playerCount = "Jumlah pemain harus minimal 2!";
    } else if (settings.maxPlayers && playerCount > settings.maxPlayers) {
      errors.playerCount = `Jumlah pemain maksimal adalah ${settings.maxPlayers}!`;
    }

    if (rounds && rounds < 1) {
      errors.rounds = "Jika diisi, jumlah babak harus minimal 1!";
    } else if (settings.maxRounds && rounds && rounds > settings.maxRounds) {
      errors.rounds = `Jumlah babak maksimal adalah ${settings.maxRounds}!`;
    } else if (!settings.allowUnlimited && !rounds) {
      errors.rounds = "Jumlah babak harus diisi!";
    }

    if (playerCount >= 2) {
      const emptyNames = playerNames.filter((name) => !name.trim());
      if (emptyNames.length > 0) {
        errors.playerCount = "Mohon isi semua nama pemain!";
      } else {
        const filledNames = playerNames
          .map((name) => name.trim().toLowerCase())
          .filter((name) => name);
        const uniqueNames = [...new Set(filledNames)];
        if (filledNames.length !== uniqueNames.length) {
          errors.playerCount =
            "Nama pemain tidak boleh sama! Mohon gunakan nama yang berbeda.";
        }
      }
    }

    setFormErrors(errors);
    const valid = Object.values(errors).every((error) => error === "");
    setIsFormValid(valid);
    return valid;
  }, [playerCount, rounds, playerNames, settings]);

  const findOrCreatePlayers = async (names) => {
    const playersData = [];
    for (const name of names) {
      const trimmedName = name.trim();
      if (!trimmedName) continue;

      try {
        const searchResponse = await fetch(
          `/api/players?search=${encodeURIComponent(trimmedName)}`
        );
        if (!searchResponse.ok) throw new Error("Search failed");
        const searchResult = await searchResponse.json();

        if (searchResult.success && searchResult.data?.length > 0) {
          const exactMatch = searchResult.data.find(
            (player) => player.name.toLowerCase() === trimmedName.toLowerCase()
          );
          const selectedPlayer = exactMatch || searchResult.data[0];
          playersData.push({
            id: selectedPlayer.id,
            name: selectedPlayer.name,
          });
        } else {
          const createResult = await createPlayer(trimmedName);
          if (createResult) playersData.push(createResult);
        }
      } catch {
        const createResult = await createPlayer(trimmedName);
        if (createResult) playersData.push(createResult);
      }
    }
    return playersData;
  };

  const createPlayer = async (name) => {
    try {
      const response = await fetch("/api/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (response.ok) {
        const result = await response.json();
        return { id: result.data.id, name: result.data.name };
      }
    } catch {}
    return null;
  };

  const showNotification = useCallback((message, type = "success") => {
    setNotification({ message, type });
  }, []);

  const handlePlayerCountChange = (e) => {
    const count = parseInt(e.target.value) || 0;
    updateFormData({
      playerCount: count,
      playerNames: count >= 2 ? Array(count).fill("") : [],
    });
  };

  const handlePlayerNameChange = (index, name) => {
    const updatedNames = [...playerNames];
    updatedNames[index] = name;
    updateFormData({ playerNames: updatedNames });

    if (name.length > 1) {
      const filteredSuggestions = playerSuggestions.filter(
        (suggestion) =>
          suggestion.toLowerCase().includes(name.toLowerCase()) &&
          suggestion.toLowerCase() !== name.toLowerCase()
      );
      setSuggestionState((prev) => ({
        ...prev,
        showSuggestions: {
          ...prev.showSuggestions,
          [index]: filteredSuggestions.length > 0 ? filteredSuggestions : [],
        },
        activeSuggestionIndex: -1,
      }));
    } else {
      setSuggestionState((prev) => ({
        ...prev,
        showSuggestions: { ...prev.showSuggestions, [index]: [] },
        activeSuggestionIndex: -1,
      }));
    }
  };

  const handleSuggestionClick = (index, suggestion) => {
    const updatedNames = [...playerNames];
    updatedNames[index] = suggestion;
    updateFormData({ playerNames: updatedNames });
    setSuggestionState((prev) => ({
      ...prev,
      showSuggestions: { ...prev.showSuggestions, [index]: [] },
    }));
  };

  const handleKeyDown = (e, index) => {
    const suggestions = showSuggestions[index] || [];
    if (suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSuggestionState((prev) => ({
        ...prev,
        activeSuggestionIndex:
          prev.activeSuggestionIndex < suggestions.length - 1
            ? prev.activeSuggestionIndex + 1
            : 0,
      }));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSuggestionState((prev) => ({
        ...prev,
        activeSuggestionIndex:
          prev.activeSuggestionIndex > 0
            ? prev.activeSuggestionIndex - 1
            : suggestions.length - 1,
      }));
    } else if (e.key === "Enter" && activeSuggestionIndex >= 0) {
      e.preventDefault();
      handleSuggestionClick(index, suggestions[activeSuggestionIndex]);
    } else if (e.key === "Escape") {
      setSuggestionState((prev) => ({
        ...prev,
        showSuggestions: { ...prev.showSuggestions, [index]: [] },
        activeSuggestionIndex: -1,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateFormRealtime()) return;

    setLoadingState({ isLoading: true, message: "Memproses data pemain..." });

    try {
      const playersData = await findOrCreatePlayers(playerNames);
      await fetchPlayerSuggestions();
      setLoadingState((prev) => ({
        ...prev,
        message: "Menyimpan data turnamen...",
      }));

      const tournamentInfo = {
        playerCount,
        rounds,
        playerNames: playersData.map((player) => player.name),
        playerIds: playersData.map((player) => player.id),
      };

      await saveTournamentData(tournamentInfo);
      const roundsText = rounds ? `${rounds} babak` : "babak unlimited";
      showNotification(
        `Turnamen berhasil dibuat dengan ${playerCount} pemain dan ${roundsText}!`,
        "success"
      );
      setLoadingState((prev) => ({
        ...prev,
        message: "Mengalihkan ke halaman game...",
      }));
      router.push("/game");
    } catch {
      showNotification("Terjadi kesalahan saat menyimpan data!", "error");
    } finally {
      setLoadingState({ isLoading: false, message: "" });
    }
  };

  const handleReset = async () => {
    setLoadingState({ isLoading: true, message: "Mereset data turnamen..." });

    try {
      updateFormData({ playerCount: 0, rounds: "", playerNames: [] });
      await resetTournamentData();
      showNotification("Form berhasil direset!", "info");
    } catch {
      showNotification("Terjadi kesalahan saat mereset data!", "error");
    } finally {
      setLoadingState({ isLoading: false, message: "" });
    }
  };

  const isPlayersFormVisible =
    playerCount >= 2 &&
    (!settings.maxPlayers || playerCount <= settings.maxPlayers) &&
    (!settings.allowUnlimited
      ? rounds && (!settings.maxRounds || rounds <= settings.maxRounds)
      : true);

  return (
    <main className={styles.container}>
      <div className={styles.body}>
        <Navbar />
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
            duration={4000}
          />
        )}
        <Loading isVisible={isLoading} message={loadingMessage} />

        <div className={styles.mainContainer}>
          <div className={styles.formContainer}>
            <div className={styles.content}>
              <h2>Setup Turnamen UNO</h2>
              <p>
                Silakan isi informasi di bawah ini untuk memulai turnamen UNO
                Anda.
              </p>

              <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                  <label htmlFor="playerCount">
                    Masukkan jumlah pemain:
                    {settings.maxPlayers &&
                      ` (Maksimal ${settings.maxPlayers})`}
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    id="playerCount"
                    name="playerCount"
                    placeholder={`Minimal 2${
                      settings.maxPlayers
                        ? `, maksimal ${settings.maxPlayers}`
                        : ""
                    } pemain`}
                    value={playerCount || ""}
                    onChange={handlePlayerCountChange}
                    required
                    disabled={isLoading}
                  />
                  {formErrors.playerCount && (
                    <div className={styles.errorMessage}>
                      {formErrors.playerCount}
                    </div>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="rounds">
                    Masukkan jumlah babak:
                    {settings.allowUnlimited
                      ? " (Opsional, kosongkan untuk unlimited)"
                      : ` (Wajib, maksimal ${
                          settings.maxRounds || "tidak terbatas"
                        })`}
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    id="rounds"
                    name="rounds"
                    placeholder={
                      settings.allowUnlimited
                        ? "Kosongkan untuk unlimited"
                        : `Maksimal ${settings.maxRounds || "tidak terbatas"}`
                    }
                    value={rounds}
                    onChange={(e) => updateFormData({ rounds: e.target.value })}
                    required={!settings.allowUnlimited}
                    disabled={isLoading}
                  />
                  {formErrors.rounds && (
                    <div className={styles.errorMessage}>
                      {formErrors.rounds}
                    </div>
                  )}
                </div>

                {isPlayersFormVisible && (
                  <div className={styles.playersContainer}>
                    <div className={styles.formGroup}>
                      <label>Nama Pemain:</label>
                      <div className={styles.playerInputs}>
                        {playerNames.map((name, index) => (
                          <div key={index} className={styles.playerInput}>
                            <div className={styles.playerNumber}>
                              {index + 1}
                            </div>
                            <div className={styles.inputWrapper}>
                              <input
                                type="text"
                                placeholder={`Masukkan nama pemain ${
                                  index + 1
                                }`}
                                value={name}
                                onChange={(e) =>
                                  handlePlayerNameChange(index, e.target.value)
                                }
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                onBlur={() =>
                                  setSuggestionState((prev) => ({
                                    ...prev,
                                    showSuggestions: {
                                      ...prev.showSuggestions,
                                      [index]: [],
                                    },
                                  }))
                                }
                                required
                                disabled={isLoading}
                              />
                              {showSuggestions[index]?.length > 0 && (
                                <div className={styles.suggestions}>
                                  {showSuggestions[index].map(
                                    (suggestion, suggestionIndex) => (
                                      <div
                                        key={suggestionIndex}
                                        className={`${styles.suggestionItem} ${
                                          suggestionIndex ===
                                          activeSuggestionIndex
                                            ? styles.active
                                            : ""
                                        }`}
                                        onMouseDown={(e) => {
                                          e.preventDefault();
                                          handleSuggestionClick(
                                            index,
                                            suggestion
                                          );
                                        }}
                                      >
                                        {suggestion}
                                      </div>
                                    )
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className={styles.ctaButtons}>
                  <button
                    type="submit"
                    className={styles.primaryBtn}
                    disabled={isLoading || !isFormValid}
                  >
                    {isLoading ? "Memproses..." : "Mulai Turnamen"}
                  </button>
                  <button
                    type="button"
                    className={styles.secondaryBtn}
                    onClick={handleReset}
                    disabled={isLoading}
                  >
                    {isLoading ? "Mereset..." : "Reset Form"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className={styles.infoContainer}>
            <div className={styles.infoCard}>
              <h3>📋 Info Tournamen</h3>
              {playerCount >= 2 || rounds ? (
                <div className={styles.tournamentInfo}>
                  <table className={styles.infoTable}>
                    <tbody>
                      <tr>
                        <td>Jumlah Pemain</td>
                        <td>:</td>
                        <td>
                          <span className={styles.infoValue}>
                            {playerCount >= 2 ? playerCount : "-"}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td>Jumlah Babak</td>
                        <td>:</td>
                        <td>
                          <span className={styles.infoValue}>
                            {rounds ? rounds : "Unlimited"}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  {playerCount >= 2 && (
                    <div className={styles.playersInfoContainer}>
                      <div className={styles.infoLabel}>Daftar Pemain:</div>
                      <div className={styles.playersInfoList}>
                        {playerNames.map((name, index) => (
                          <div key={index} className={styles.playerInfoItem}>
                            <span className={styles.playerInfoNumber}>
                              {index + 1}
                            </span>
                            <span className={styles.playerInfoName}>
                              {name || `Pemain ${index + 1}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className={styles.infoPlaceholder}>
                  💡 Isi form di sebelah kiri untuk melihat info tournamen
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Index;
