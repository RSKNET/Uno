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
  const [formErrors, setFormErrors] = useState({ playerCount: "", rounds: "", playerNames: "" });
  const [isFormValid, setIsFormValid] = useState(false);

  const { playerCount, rounds, playerNames } = formData;
  const { isLoading, message: loadingMessage } = loadingState;
  const { playerSuggestions, activeSuggestionIndex, showSuggestions } =
    suggestionState;

  const [currentStep, setCurrentStep] = useState(1);

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
      const response = await fetch("/api/player/players");
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
        errors.playerNames = "Mohon isi semua nama pemain!";
      } else {
        const filledNames = playerNames
          .map((name) => name.trim().toLowerCase())
          .filter((name) => name);
        const uniqueNames = [...new Set(filledNames)];
        if (filledNames.length !== uniqueNames.length) {
          errors.playerNames =
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
    const playersData = await Promise.all(
      names.map(async (name) => {
        const trimmedName = name.trim();
        if (!trimmedName) return null;

        try {
          const searchResponse = await fetch(
            `/api/player/players?search=${encodeURIComponent(trimmedName)}`
          );
          if (!searchResponse.ok) throw new Error("Search failed");
          const searchResult = await searchResponse.json();

          if (searchResult.success && searchResult.data?.length > 0) {
            const exactMatch = searchResult.data.find(
              (player) => player.name.toLowerCase() === trimmedName.toLowerCase()
            );
            const selectedPlayer = exactMatch || searchResult.data[0];
            return {
              id: selectedPlayer.id,
              name: selectedPlayer.name,
            };
          } else {
            return await createPlayer(trimmedName);
          }
        } catch {
          return await createPlayer(trimmedName);
        }
      })
    );
    
    return playersData.filter(Boolean);
  };

  const createPlayer = async (name) => {
    try {
      const response = await fetch("/api/player/players", {
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
      setCurrentStep(1);
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

  const filledCount = playerNames.filter((n) => n.trim()).length;

  return (
    <main className={styles.container}>
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

      <div className={styles.swipeViewport}>
        <form 
          onSubmit={handleSubmit} 
          className={styles.swipeTrack}
          style={{ transform: `translateY(${currentStep === 1 ? '0' : '-50%'})` }}
        >
          {/* STEP 1: Main Setup */}
          <div className={styles.screenStep}>
            <div className={styles.body}>
              {/* Left Side: Massive Typography */}
              <div className={styles.editorialLeft}>
                <h1 className={styles.massiveTitle}>
                  UNO<br />Tournament
                </h1>
                <p className={styles.editorialSub}>
                  Set up the game. Crush your friends. Ethereal UI.
                </p>
              </div>

              {/* Right Side: Interactive Form Card */}
              <div className={styles.formRight}>
                <div className={`${styles.formWrapper} double-bezel`}>
                  <div className={`${styles.formCard} double-bezel-inner`}>
                    {/* Header */}
                    <div className={styles.header}>
                      <h2>Setup Turnamen</h2>
                      <p>Atur jumlah pemain dan babak untuk memulai</p>
                    </div>

                    {/* Summary strip */}
                    {(playerCount >= 2 || rounds) && (
                      <div className={styles.summaryStrip}>
                        <div className={styles.summaryItem}>
                          <span className={styles.summaryValue}>
                            {playerCount >= 2 ? playerCount : "-"}
                          </span>
                          <span className={styles.summaryLabel}>Pemain</span>
                        </div>
                        <div className={styles.summaryDivider} />
                        <div className={styles.summaryItem}>
                          <span className={styles.summaryValue}>
                            {rounds || "\u221E"}
                          </span>
                          <span className={styles.summaryLabel}>Babak</span>
                        </div>
                      </div>
                    )}

                    {/* Top Inputs */}
                    <div className={styles.inputRow}>
                      <div className={styles.formGroup}>
                        <label htmlFor="playerCount">
                          Jumlah Pemain
                          {settings.maxPlayers && (
                            <span className={styles.labelHint}>
                              {" "}
                              maks. {settings.maxPlayers}
                            </span>
                          )}
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          id="playerCount"
                          name="playerCount"
                          placeholder="Min. 2"
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
                          Jumlah Babak
                          {settings.allowUnlimited && (
                            <span className={styles.labelHint}> opsional</span>
                          )}
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          id="rounds"
                          name="rounds"
                          placeholder={
                            settings.allowUnlimited ? "Unlimited" : "Wajib diisi"
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
                    </div>

                    <div className={styles.ctaButtons}>
                      {isPlayersFormVisible ? (
                        <button
                          type="button"
                          className={styles.primaryBtn}
                          onClick={() => setCurrentStep(2)}
                        >
                          <span>Isi Nama Pemain</span>
                          <div className={styles.primaryBtnIcon}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                          </div>
                        </button>
                      ) : (
                        <button
                          type="button"
                          className={styles.secondaryBtn}
                          onClick={handleReset}
                          disabled={isLoading}
                        >
                          {isLoading ? "Mereset..." : "Reset"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 2: Player Names (Scroll down) */}
          <div className={styles.screenStep}>
            {isPlayersFormVisible && (
              <div className={styles.bottomSection}>
                <div className={styles.bottomSectionInner}>
                  <div className={styles.bottomSectionGrid}>
                    {/* Left: Player Names */}
                    <div className={`${styles.playersSectionWrapper} double-bezel`}>
                      <div className={`${styles.playersSection} double-bezel-inner`}>
                        <label className={styles.sectionLabel}>
                          Nama Pemain
                          <span className={styles.labelHint}>
                            {" "}
                            {filledCount}/{playerCount}
                          </span>
                        </label>
                        <div className={`${styles.playerInputs} ${playerCount > 10 ? styles.twoColumns : ""}`}>
                          {playerNames.map((name, index) => (
                            <div key={index} className={styles.playerInput}>
                              <span className={styles.playerNumber}>
                                {index + 1}
                              </span>
                              <div className={styles.inputWrapper}>
                                <input
                                  type="text"
                                  placeholder={`Pemain ${index + 1}`}
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

                    {/* Right: Preview */}
                    <div className={`${styles.previewWrapper} double-bezel`}>
                      <div className={`${styles.previewCard} double-bezel-inner`}>
                        <div className={styles.previewHeader}>
                          <h4>Preview Turnamen</h4>
                        </div>
                        <div className={styles.previewGrid}>
                          <div className={styles.previewStat}>
                            <span className={styles.previewStatValue}>{playerCount}</span>
                            <span className={styles.previewStatLabel}>Pemain</span>
                          </div>
                          <div className={styles.previewStat}>
                            <span className={styles.previewStatValue}>
                              {rounds || "\u221E"}
                            </span>
                            <span className={styles.previewStatLabel}>Babak</span>
                          </div>
                          <div className={styles.previewStat}>
                            <span className={styles.previewStatValue}>
                              {playerCount > 0 ? playerCount - 1 : 0}
                            </span>
                            <span className={styles.previewStatLabel}>Poin Maks</span>
                          </div>
                        </div>
                        <div className={styles.previewPlayers}>
                          {playerNames.map((name, index) => (
                            <div key={index} className={styles.previewPlayerChip}>
                              <span className={styles.previewPlayerPos}>{index + 1}</span>
                              <span className={styles.previewPlayerName}>{name || `Pemain ${index + 1}`}</span>
                            </div>
                          ))}
                        </div>

                        {/* Bottom CTA Buttons inside Preview */}
                        <div className={styles.previewCta}>
                          {formErrors.playerNames && (
                            <div className={styles.errorMessage} style={{ marginBottom: "12px", textAlign: "center" }}>
                              {formErrors.playerNames}
                            </div>
                          )}
                          <button
                            type="submit"
                            className={styles.primaryBtn}
                            disabled={isLoading || !isFormValid}
                          >
                            <span>{isLoading ? "Memproses..." : "Mulai Permainan"}</span>
                            <div className={styles.primaryBtnIcon}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12h14M12 5l7 7-7 7"/>
                              </svg>
                            </div>
                          </button>
                          <button
                            type="button"
                            className={styles.secondaryBtn}
                            onClick={handleReset}
                            disabled={isLoading}
                          >
                            {isLoading ? "Mereset..." : "Reset"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </main>
  );
};

export default Index;
