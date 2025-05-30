"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "../styles/index.module.css";

interface Player {
  id: number;
  name: string;
  score: number;
  wins: number;
}

interface TournamentData {
  playerCount: number;
  gamesPerRound: number | null;
  players: Player[];
}

interface GameState {
  completedGames: number[];
  playerScores: Record<
    number,
    {
      name: string;
      totalScore: number;
      wins: number;
    }
  >;
}

const UnoTournamentManager: React.FC = () => {
  const router = useRouter();
  const [tournamentData, setTournamentData] = useState<TournamentData>({
    playerCount: 0,
    gamesPerRound: null,
    players: [],
  });

  const [showExistingTournament, setShowExistingTournament] = useState(false);
  const [showPlayersContainer, setShowPlayersContainer] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [playerInputs, setPlayerInputs] = useState<string[]>([]);
  const [submitDisabled, setSubmitDisabled] = useState(false);
  const [submitText, setSubmitText] = useState("Mulai Turnamen");

  useEffect(() => {
    checkExistingTournament();
  }, []);

  const checkExistingTournament = () => {
    try {
      const savedData = sessionStorage.getItem("unoTournamentData");
      const savedGameState = sessionStorage.getItem("unoGameState");

      if (savedData && savedGameState) {
        const gameState: GameState = JSON.parse(savedGameState);
        if (gameState.completedGames && gameState.completedGames.length > 0) {
          setShowExistingTournament(true);
          return;
        }
      }

      setShowExistingTournament(false);
    } catch (error) {
      console.log("Error checking existing tournament:", error);
      setShowExistingTournament(false);
    }
  };

  const continueTournament = () => {
    setShowLoading(true);
    setTimeout(() => {
      navigateToGamePage();
    }, 1500);
  };

  const resetTournament = () => {
    const confirmation = confirm(
      "Apakah Anda yakin ingin menghapus turnamen yang sedang berlangsung? Semua data akan hilang!"
    );

    if (confirmation) {
      sessionStorage.removeItem("unoTournamentData");
      sessionStorage.removeItem("unoGameState");
      sessionStorage.removeItem("unoGameHistory");

      setShowExistingTournament(false);

      setTournamentData({
        playerCount: 0,
        gamesPerRound: null,
        players: [],
      });
      setShowPlayersContainer(false);
      setPlayerInputs([]);

      alert("✅ Turnamen berhasil direset! Silakan buat turnamen baru.");
    }
  };

  const handlePlayerCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const playerCount = parseInt(e.target.value) || 0;

    if (playerCount > 0) {
      setShowPlayersContainer(true);
      const newInputs = Array(playerCount).fill("");
      setPlayerInputs(newInputs);
    } else {
      setShowPlayersContainer(false);
      setPlayerInputs([]);
    }

    setTournamentData((prev) => ({ ...prev, playerCount }));
  };

  const handleGamesPerRoundChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    const gamesPerRound = value === "" ? null : parseInt(value) || 0;
    setTournamentData((prev) => ({ ...prev, gamesPerRound }));
  };

  const handlePlayerNameChange = (index: number, value: string) => {
    const newInputs = [...playerInputs];
    newInputs[index] = value;
    setPlayerInputs(newInputs);
  };

  const navigateToGamePage = () => {
    setShowLoading(false);

    try {
      router.push("/game");
    } catch (error) {
      console.log("Redirect error:", error);
      console.log(
        "Turnamen berhasil dibuat! Silakan buka halaman game untuk melanjutkan."
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setSubmitDisabled(true);
    setSubmitText("Memproses...");

    try {
      if (tournamentData.playerCount < 1) {
        throw new Error("Jumlah pemain harus minimal 1!");
      }

      const players: Player[] = [];
      for (let i = 0; i < tournamentData.playerCount; i++) {
        const playerName = playerInputs[i]?.trim();
        if (!playerName) {
          throw new Error("Mohon isi semua nama pemain!");
        }
        players.push({
          id: i + 1,
          name: playerName,
          score: 0,
          wins: 0,
        });
      }

      const playerNames = players.map((p) => p.name.toLowerCase());
      const duplicateNames = playerNames.filter(
        (name, index) => playerNames.indexOf(name) !== index
      );
      if (duplicateNames.length > 0) {
        throw new Error(
          "Nama pemain tidak boleh sama! Mohon gunakan nama yang berbeda."
        );
      }

      const finalTournamentData = { ...tournamentData, players };

      setShowLoading(true);

      saveTournamentData(finalTournamentData);

      setTimeout(() => {
        navigateToGamePage();
      }, 2000);
    } catch (error) {
      alert("❌ " + (error as Error).message);
      setSubmitDisabled(false);
      setSubmitText("Mulai Turnamen");
      console.error("Tournament creation error:", error);
    }
  };

  const saveTournamentData = (data: TournamentData) => {
    try {
      sessionStorage.setItem("unoTournamentData", JSON.stringify(data));

      const initialGameState: GameState = {
        completedGames: [],
        playerScores: {},
      };

      data.players.forEach((player) => {
        initialGameState.playerScores[player.id] = {
          name: player.name,
          totalScore: 0,
          wins: 0,
        };
      });

      sessionStorage.setItem("unoGameState", JSON.stringify(initialGameState));
      sessionStorage.removeItem("unoGameHistory");

      console.log("✅ Data turnamen berhasil disimpan:", data);
      console.log("✅ Game state berhasil diinisialisasi:", initialGameState);
    } catch (error) {
      console.error("❌ Error menyimpan data turnamen:", error);
      throw new Error("Gagal menyimpan data turnamen. Mohon coba lagi.");
    }
  };

  const showInfo =
    tournamentData.playerCount > 0 || tournamentData.gamesPerRound !== null;

  return (
    <div className={styles.container}>
      <div className={styles.body}>
        {showLoading && (
          <div className={styles.loadingOverlay}>
            <div className={styles.loadingContent}>
              <div className={styles.loadingSpinner}></div>
              <div className={styles.loadingText}>Memproses Turnamen...</div>
              <div className={styles.loadingSubtext}>Mohon tunggu sebentar</div>
            </div>
          </div>
        )}

        <div className={styles.mainContainer}>
          <div className={styles.formContainer}>
            <div className={styles.header}>
              <h1>🎮 UNO Tournament</h1>
              <p>Kelola turnamen UNO Anda dengan mudah</p>
            </div>

            {showExistingTournament && (
              <div className={styles.existingTournament}>
                <h3>⚠️ Turnamen Ditemukan</h3>
                <p>
                  Terdapat turnamen yang sedang berlangsung. Apa yang ingin Anda
                  lakukan?
                </p>
                <div className={styles.existingTournamentButtons}>
                  <button
                    type="button"
                    className={`${styles.btn} ${styles.btnSecondary}`}
                    onClick={continueTournament}
                  >
                    Lanjutkan Turnamen
                  </button>
                  <button
                    type="button"
                    className={`${styles.btn} ${styles.btnDanger}`}
                    onClick={resetTournament}
                  >
                    Reset & Buat Baru
                  </button>
                </div>
              </div>
            )}

            {!showExistingTournament && (
              <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                  <label htmlFor="playerCount">Jumlah Pemain:</label>
                  <input
                    type="number"
                    id="playerCount"
                    name="playerCount"
                    placeholder="Masukkan jumlah pemain (contoh: 4)"
                    min="1"
                    required
                    value={tournamentData.playerCount || ""}
                    onChange={handlePlayerCountChange}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="gamesPerRound">
                    Jumlah Babak (opsional):
                  </label>
                  <input
                    type="number"
                    id="gamesPerRound"
                    name="gamesPerRound"
                    placeholder="Kosongkan untuk babak unlimited"
                    min="1"
                    value={tournamentData.gamesPerRound || ""}
                    onChange={handleGamesPerRoundChange}
                  />
                </div>

                {showPlayersContainer && (
                  <div className={styles.playersContainer}>
                    <div className={styles.formGroup}>
                      <label>Nama Pemain:</label>
                      <div>
                        {playerInputs.map((value, index) => (
                          <div key={index} className={styles.playerInput}>
                            <div className={styles.playerNumber}>
                              {index + 1}
                            </div>
                            <input
                              type="text"
                              placeholder={`Masukkan nama pemain ${index + 1}`}
                              required
                              value={value}
                              onChange={(e) =>
                                handlePlayerNameChange(index, e.target.value)
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className={styles.btn}
                  disabled={submitDisabled}
                >
                  {submitText}
                </button>
              </form>
            )}
          </div>

          <div className={styles.infoContainer}>
            <div className={styles.infoCard}>
              <h3>📋 Ringkasan Turnamen</h3>
              {showInfo ? (
                <div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Jumlah Pemain:</span>
                    <span className={styles.infoValue}>
                      {tournamentData.playerCount || "-"}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Jumlah Babak:</span>
                    <span className={styles.infoValue}>
                      {tournamentData.gamesPerRound !== null
                        ? tournamentData.gamesPerRound
                        : "Unlimited"}
                    </span>
                  </div>
                </div>
              ) : (
                <div className={styles.infoPlaceholder}>
                  💡 Isi form di sebelah kiri untuk melihat ringkasan turnamen
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnoTournamentManager;
