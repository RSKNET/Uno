import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Navbar from "@/components/Navbar";
import Notification from "@/components/Notification";
import Loading from "@/components/Loading";
import { useTournament } from "@/context/TournamentContext";
import styles from "@/styles/pages/LandingPage.module.css";

const LandingPage = () => {
  const router = useRouter();
  const { tournamentData, saveTournamentData, resetTournamentData } =
    useTournament();

  const [playerCount, setPlayerCount] = useState(
    tournamentData.playerCount || 0
  );
  const [rounds, setRounds] = useState(tournamentData.rounds || "");
  const [playerNames, setPlayerNames] = useState(
    tournamentData.playerNames || []
  );
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [playerSuggestions, setPlayerSuggestions] = useState([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState({});

  useEffect(() => {
    fetchPlayerSuggestions();
  }, []);

  const fetchPlayerSuggestions = async () => {
    try {
      const response = await fetch("/api/players");
      const result = await response.json();
      if (result.success) {
        setPlayerSuggestions(result.data.map((player) => player.name));
      }
    } catch (error) {
      console.error("Error fetching player suggestions:", error);
    }
  };

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
  };

  const closeNotification = () => {
    setNotification(null);
  };

  const handlePlayerCountChange = (e) => {
    const count = parseInt(e.target.value) || 0;
    setPlayerCount(count);

    if (count >= 2) {
      setPlayerNames(Array(count).fill(""));
    } else {
      setPlayerNames([]);
    }
  };

  const handlePlayerNameChange = (index, name) => {
    const updatedNames = [...playerNames];
    updatedNames[index] = name;
    setPlayerNames(updatedNames);

    if (name.length > 1) {
      const filteredSuggestions = playerSuggestions.filter(
        (suggestion) =>
          suggestion.toLowerCase().includes(name.toLowerCase()) &&
          suggestion.toLowerCase() !== name.toLowerCase()
      );
      setShowSuggestions({
        ...showSuggestions,
        [index]: filteredSuggestions.length > 0 ? filteredSuggestions : [],
      });
    } else {
      setShowSuggestions({
        ...showSuggestions,
        [index]: [],
      });
    }
    setActiveSuggestionIndex(-1);
  };

  const handleSuggestionClick = (index, suggestion) => {
    const updatedNames = [...playerNames];
    updatedNames[index] = suggestion;
    setPlayerNames(updatedNames);
    setShowSuggestions({
      ...showSuggestions,
      [index]: [],
    });
  };

  const handleKeyDown = (e, index) => {
    const suggestions = showSuggestions[index] || [];
    if (suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveSuggestionIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveSuggestionIndex((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (e.key === "Enter" && activeSuggestionIndex >= 0) {
      e.preventDefault();
      handleSuggestionClick(index, suggestions[activeSuggestionIndex]);
    } else if (e.key === "Escape") {
      setShowSuggestions({
        ...showSuggestions,
        [index]: [],
      });
      setActiveSuggestionIndex(-1);
    }
  };

  const validateForm = () => {
    if (playerCount < 2) {
      showNotification("Jumlah pemain harus minimal 2!", "error");
      return false;
    }

    if (rounds && rounds < 1) {
      showNotification("Jika diisi, jumlah babak harus minimal 1!", "error");
      return false;
    }

    const emptyNames = playerNames.filter((name) => !name.trim());
    if (emptyNames.length > 0) {
      showNotification("Mohon isi semua nama pemain!", "warning");
      return false;
    }

    const lowerCaseNames = playerNames.map((name) => name.trim().toLowerCase());
    const duplicateNames = lowerCaseNames.filter(
      (name, index) => lowerCaseNames.indexOf(name) !== index
    );

    if (duplicateNames.length > 0) {
      showNotification(
        "Nama pemain tidak boleh sama! Mohon gunakan nama yang berbeda.",
        "error"
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setLoadingMessage("Menyimpan data turnamen...");

    try {
      const tournamentInfo = {
        playerCount,
        rounds,
        playerNames: playerNames.map((name) => name.trim()),
      };

      // Real case: menyimpan data ke context/database
      await saveTournamentData(tournamentInfo);

      const roundsText = rounds ? `${rounds} babak` : "babak unlimited";
      showNotification(
        `Turnamen berhasil dibuat dengan ${playerCount} pemain dan ${roundsText}!`,
        "success"
      );

      setLoadingMessage("Mengalihkan ke halaman game...");

      // Redirect langsung tanpa setTimeout
      router.push("/GamePage");
    } catch (error) {
      console.error("Error saving tournament data:", error);
      showNotification("Terjadi kesalahan saat menyimpan data!", "error");
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  const handleReset = async () => {
    setIsLoading(true);
    setLoadingMessage("Mereset data turnamen...");

    try {
      // Reset state variables
      setPlayerCount(0);
      setRounds("");
      setPlayerNames([]);

      // Real case: reset data di context/database
      await resetTournamentData();

      showNotification("Form berhasil direset!", "info");
    } catch (error) {
      console.error("Error resetting tournament data:", error);
      showNotification("Terjadi kesalahan saat mereset data!", "error");
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  return (
    <main className={styles.container}>
      <div className={styles.body}>
        <Navbar />

        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={closeNotification}
            duration={4000}
          />
        )}

        {/* Loading Component dengan real case loading */}
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
                  <label htmlFor="playerCount">Masukkan jumlah pemain:</label>
                  <input
                    type="number"
                    id="playerCount"
                    name="playerCount"
                    placeholder="Minimal 2 pemain"
                    min="2"
                    value={playerCount || ""}
                    onChange={handlePlayerCountChange}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="rounds">
                    Masukkan jumlah babak (opsional):
                  </label>
                  <input
                    type="number"
                    id="rounds"
                    name="rounds"
                    placeholder="Kosongkan untuk unlimited"
                    min="1"
                    value={rounds}
                    onChange={(e) => setRounds(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                {playerCount >= 2 && (
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
                                onBlur={() => {
                                  setTimeout(() => {
                                    setShowSuggestions({
                                      ...showSuggestions,
                                      [index]: [],
                                    });
                                  }, 200);
                                }}
                                required
                                disabled={isLoading}
                              />
                              {showSuggestions[index] &&
                                showSuggestions[index].length > 0 && (
                                  <div className={styles.suggestions}>
                                    {showSuggestions[index].map(
                                      (suggestion, suggestionIndex) => (
                                        <div
                                          key={suggestionIndex}
                                          className={`${
                                            styles.suggestionItem
                                          } ${
                                            suggestionIndex ===
                                            activeSuggestionIndex
                                              ? styles.active
                                              : ""
                                          }`}
                                          onClick={() =>
                                            handleSuggestionClick(
                                              index,
                                              suggestion
                                            )
                                          }
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
                    disabled={isLoading}
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

export default LandingPage;
