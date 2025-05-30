"use client";

import React, { useState, useEffect } from "react";
import PdfExportButton from "./components/PdfExportButton";
import styles from "../styles/game.module.css";

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

interface Ranking {
  rank: number;
  playerId: number;
  score: number;
}

interface GameResult {
  gameNumber: number;
  date: string;
  rankings: Ranking[];
}

interface PlayerScore {
  name: string;
  totalScore: number;
  wins: number;
}

interface PlayerStats {
  id: number;
  name: string;
  wins: number[];
}

interface GameState {
  completedGames: number[];
  playerScores: { [key: number]: PlayerScore };
}

const Game: React.FC = () => {
  const [tournamentData, setTournamentData] = useState<TournamentData | null>(
    null
  );
  const [gameState, setGameState] = useState<GameState>({
    completedGames: [],
    playerScores: {},
  });
  const [alertMessage, setAlertMessage] = useState<{
    message: string;
    type: string;
  } | null>(null);
  const [gameHistory, setGameHistory] = useState<GameResult[]>([]);

  useEffect(() => {
    loadTournamentData();
  }, []);

  useEffect(() => {
    if (tournamentData) {
      initializeGame();
    }
  }, [tournamentData]);

  const loadTournamentData = () => {
    try {
      const savedTournamentData = sessionStorage.getItem("unoTournamentData");

      if (savedTournamentData) {
        const parsedData: TournamentData = JSON.parse(savedTournamentData);
        setTournamentData(parsedData);
        console.log("Data turnamen dimuat dari sessionStorage:", parsedData);
        return true;
      } else {
        const mockData: TournamentData = {
          playerCount: 4,
          gamesPerRound: null,
          players: [
            { id: 1, name: "Pemain 1", score: 0, wins: 0 },
            { id: 2, name: "Pemain 2", score: 0, wins: 0 },
            { id: 3, name: "Pemain 3", score: 0, wins: 0 },
            { id: 4, name: "Pemain 4", score: 0, wins: 0 },
          ],
        };
        setTournamentData(mockData);
        console.log("Data turnamen dimuat (mock data):", mockData);
        return true;
      }
    } catch (error) {
      console.error("Error memuat data turnamen:", error);
      return false;
    }
  };

  const initializeGame = () => {
    if (!tournamentData) return;

    loadGameState();
    loadGameHistory();
  };

  const loadGameState = () => {
    try {
      const savedGameState = sessionStorage.getItem("unoGameState");

      if (savedGameState) {
        const parsedGameState: GameState = JSON.parse(savedGameState);
        setGameState(parsedGameState);
        console.log("Game state dimuat dari sessionStorage:", parsedGameState);
      } else {
        initializePlayerScores();
      }
    } catch (error) {
      console.error("Error memuat game state:", error);
      initializePlayerScores();
    }
  };

  const loadGameHistory = () => {
    try {
      const savedHistory = sessionStorage.getItem("unoGameHistory");

      if (savedHistory) {
        const parsedHistory: GameResult[] = JSON.parse(savedHistory);
        setGameHistory(parsedHistory);
        console.log("Game history dimuat dari sessionStorage:", parsedHistory);
      }
    } catch (error) {
      console.error("Error memuat game history:", error);
    }
  };

  const initializePlayerScores = () => {
    if (!tournamentData) return;

    const newPlayerScores: { [key: number]: PlayerScore } = {};
    tournamentData.players.forEach((player) => {
      newPlayerScores[player.id] = {
        name: player.name,
        totalScore: player.score || 0,
        wins: player.wins || 0,
      };
    });

    const initialGameState: GameState = {
      completedGames: [],
      playerScores: newPlayerScores,
    };

    setGameState(initialGameState);

    try {
      sessionStorage.setItem("unoGameState", JSON.stringify(initialGameState));
    } catch (error) {
      console.error("Error menyimpan initial game state:", error);
    }
  };

  const saveGameResult = (gameNumber: number, rankings: Ranking[]) => {
    const gameResult: GameResult = {
      gameNumber,
      date: new Date().toISOString(),
      rankings: rankings,
    };

    const newCompletedGames = [...gameState.completedGames, gameNumber].sort(
      (a, b) => a - b
    );
    const newPlayerScores = { ...gameState.playerScores };

    rankings.forEach((ranking) => {
      newPlayerScores[ranking.playerId].totalScore += ranking.score;
      if (ranking.rank === 1) {
        newPlayerScores[ranking.playerId].wins += 1;
      }
    });

    const newGameState = {
      ...gameState,
      completedGames: newCompletedGames,
      playerScores: newPlayerScores,
    };

    setGameState(newGameState);

    const newGameHistory = [...gameHistory, gameResult];
    setGameHistory(newGameHistory);

    try {
      sessionStorage.setItem("unoGameState", JSON.stringify(newGameState));
      sessionStorage.setItem("unoGameHistory", JSON.stringify(newGameHistory));
      console.log("Game state dan history berhasil disimpan");
    } catch (error) {
      console.error("Error menyimpan game state:", error);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!tournamentData) return;

    if (
      tournamentData.gamesPerRound !== null &&
      gameState.completedGames.length >= tournamentData.gamesPerRound
    ) {
      showAlert("Semua babak telah selesai!", "error");
      return;
    }

    const formData = new FormData(e.currentTarget);
    const nextGameNumber = getNextAvailableGameNumber();

    const rankings: Ranking[] = [];
    const selectedPlayers: number[] = [];

    for (let i = 1; i <= tournamentData.playerCount; i++) {
      const playerId = formData.get(`rank${i}`) as string;
      if (!playerId) {
        showAlert(
          "Mohon pilih semua pemain untuk setiap posisi juara!",
          "error"
        );
        return;
      }

      const playerIdNum = parseInt(playerId);
      if (selectedPlayers.includes(playerIdNum)) {
        showAlert(
          "Satu pemain tidak bisa menempati dua posisi sekaligus!",
          "error"
        );
        return;
      }

      selectedPlayers.push(playerIdNum);
      rankings.push({
        rank: i,
        playerId: playerIdNum,
        score: Math.max(0, tournamentData.playerCount - i),
      });
    }

    if (gameState.completedGames.includes(nextGameNumber)) {
      showAlert("Babak ini sudah selesai!", "error");
      return;
    }

    saveGameResult(nextGameNumber, rankings);

    e.currentTarget.reset();
    showAlert(`Hasil babak ${nextGameNumber} berhasil disimpan!`, "success");
  };

  const showAlert = (message: string, type: string = "info") => {
    setAlertMessage({ message, type });
    setTimeout(() => {
      setAlertMessage(null);
    }, 5000);
  };

  const getSortedPlayers = () => {
    return Object.entries(gameState.playerScores)
      .map(([id, data]) => ({ id: parseInt(id), ...data }))
      .sort((a, b) => {
        if (b.totalScore === a.totalScore) {
          return b.wins - a.wins;
        }
        return b.totalScore - a.totalScore;
      });
  };

  const getSortedHistory = () => {
    return [...gameHistory].sort((a, b) => a.gameNumber - b.gameNumber);
  };

  const getNextAvailableGameNumber = () => {
    if (gameState.completedGames.length === 0) return 1;
    return Math.max(...gameState.completedGames) + 1;
  };

  const isTournamentComplete = () => {
    if (!tournamentData) return false;
    if (tournamentData.gamesPerRound === null) return false;
    return gameState.completedGames.length >= tournamentData.gamesPerRound;
  };

  const handleResetTournament = () => {
    const confirmation = confirm(
      "Apakah Anda yakin ingin mereset turnamen? Semua data akan hilang!"
    );

    if (confirmation) {
      sessionStorage.removeItem("unoTournamentData");
      sessionStorage.removeItem("unoGameState");
      sessionStorage.removeItem("unoGameHistory");

      try {
        window.location.href = "/";
      } catch (error) {
        console.log("Redirect error:", error);
        alert(
          "✅ Turnamen berhasil direset! Silakan refresh halaman dan buat turnamen baru."
        );
      }
    }
  };

  const handleBackToSetup = () => {
    try {
      window.location.href = "/";
    } catch (error) {
      console.log("Redirect error:", error);
      alert("Silakan navigasi kembali ke halaman setup turnamen.");
    }
  };

  const getPlayerStats = (): PlayerStats[] => {
    if (!tournamentData) return [];

    const stats: PlayerStats[] = tournamentData.players.map((player) => ({
      id: player.id,
      name: player.name,
      wins: Array(tournamentData.playerCount).fill(0),
    }));

    gameHistory.forEach((game) => {
      game.rankings.forEach((ranking) => {
        const playerIndex = stats.findIndex((p) => p.id === ranking.playerId);
        if (playerIndex !== -1) {
          stats[playerIndex].wins[ranking.rank - 1] += 1;
        }
      });
    });

    return stats;
  };

  if (!tournamentData) {
    return (
      <div className={styles.gameContainer}>
        <div className={styles.mainContainer}>
          <div className={styles.leftSection}>
            <div className={styles.container}>
              <div className={styles.noDataMessage}>
                <h3>⚠️ Data Turnamen Tidak Ditemukan</h3>
                <p>Silakan buat turnamen terlebih dahulu di halaman setup.</p>
                <br />
                <button onClick={handleBackToSetup} className={styles.btn}>
                  ← Kembali ke Setup Turnamen
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const sortedPlayers = getSortedPlayers();
  const sortedHistory = getSortedHistory();
  const nextGameNumber = getNextAvailableGameNumber();

  return (
    <div className={styles.gameContainer}>
      <div className={styles.mainContainer}>
        <div className={styles.leftSection}>
          <div className={styles.container}>
            <div className={styles.header}>
              <h1>🎮 UNO Tournament</h1>
              <p>Pengelolaan Poin dan Skor</p>
              <div className={styles.buttonGroup}>
                <PdfExportButton
                  tournamentData={tournamentData}
                  gameState={gameState}
                  gameHistory={gameHistory}
                />
                <button
                  onClick={handleResetTournament}
                  className={`${styles.btn} ${styles.btnDanger}`}
                >
                  🔄 Reset Turnamen
                </button>
              </div>
            </div>

            <div className={styles.tournamentInfo}>
              <h3>📋 Informasi Turnamen</h3>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>Jumlah Pemain</div>
                  <div className={styles.infoValue}>
                    {tournamentData.playerCount}
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>Jumlah Babak</div>
                  <div className={styles.infoValue}>
                    {tournamentData.gamesPerRound !== null
                      ? tournamentData.gamesPerRound
                      : "Unlimited"}
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>Babak Selesai</div>
                  <div className={styles.infoValue}>
                    {gameState.completedGames.length}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.container}>
            <div className={styles.formSection}>
              <div className={styles.currentRound}>Babak {nextGameNumber}</div>

              <h3>➕ Tambah Poin Babak</h3>

              {alertMessage && (
                <div
                  className={
                    alertMessage.type === "error"
                      ? styles.alert
                      : styles.success
                  }
                >
                  {alertMessage.message}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                  <label>Urutan Juara (dari Juara 1 sampai terakhir):</label>
                  <div className={styles.rankingContainer}>
                    {Array.from(
                      { length: tournamentData.playerCount },
                      (_, i) => i + 1
                    ).map((rank) => {
                      const score = Math.max(
                        0,
                        tournamentData.playerCount - rank
                      );
                      return (
                        <div key={rank} className={styles.rankItem}>
                          <div className={styles.rankNumber}>{rank}</div>
                          <div className={styles.rankPlayer}>
                            <select
                              name={`rank${rank}`}
                              id={`rank${rank}`}
                              required
                            >
                              <option value="">
                                Pilih Pemain Juara {rank}
                              </option>
                              {tournamentData.players.map((player) => (
                                <option key={player.id} value={player.id}>
                                  {player.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className={styles.rankScore}>+{score}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  className={styles.btn}
                  disabled={isTournamentComplete()}
                >
                  {isTournamentComplete()
                    ? "Turnamen Selesai"
                    : "Simpan Hasil Babak"}
                </button>
              </form>
            </div>

            <div className={styles.historySection}>
              <h3>📚 Riwayat Babak</h3>
              <div className={styles.historyList}>
                {sortedHistory.length === 0 ? (
                  <div className={styles.noHistoryMessage}>
                    Belum ada riwayat babak
                  </div>
                ) : (
                  sortedHistory.map((game) => {
                    const gameDate = new Date(game.date);
                    const formattedDate = gameDate.toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <div key={game.gameNumber} className={styles.historyItem}>
                        <div className={styles.historyHeader}>
                          <div className={styles.historyRound}>
                            Babak {game.gameNumber}
                          </div>
                          <div className={styles.historyDate}>
                            {formattedDate}
                          </div>
                        </div>
                        <div className={styles.historyContent}>
                          {game.rankings
                            .sort((a, b) => a.rank - b.rank)
                            .map((ranking) => {
                              const player = tournamentData.players.find(
                                (p) => p.id === ranking.playerId
                              );
                              return (
                                <div
                                  key={ranking.rank}
                                  className={styles.rankingItem}
                                >
                                  <div className={styles.playerRank}>
                                    <div className={styles.rankBadge}>
                                      {ranking.rank}
                                    </div>
                                    <div className={styles.playerName}>
                                      {player ? player.name : "Unknown"}
                                    </div>
                                  </div>
                                  <div className={styles.playerScoreBadge}>
                                    +{ranking.score} poin
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.leaderboard}>
          <h3>🏆 Papan Skor</h3>
          <div>
            {sortedPlayers.map((player, index) => (
              <div key={player.id} className={styles.playerScore}>
                <div className={styles.playerName}>
                  {index === 0
                    ? "🥇"
                    : index === 1
                    ? "🥈"
                    : index === 2
                    ? "🥉"
                    : `${index + 1}.`}{" "}
                  {player.name}
                  {player.wins > 0 ? ` (${player.wins} kemenangan)` : ""}
                </div>
                <div className={styles.playerTotalScore}>
                  {player.totalScore}
                </div>
              </div>
            ))}
          </div>

          <div className={styles.winnerStats}>
            <h3>📊 Statistik Juara per Pemain</h3>
            <div className={styles.statsGrid}>
              {getPlayerStats().map((player) => (
                <div key={player.id} className={styles.playerStats}>
                  <h4>{player.name}</h4>
                  {player.wins.map((count, index) => (
                    <div key={index} className={styles.statItem}>
                      <span className={styles.statLabel}>
                        Juara {index + 1}:
                      </span>
                      <span className={styles.statValue}>{count}x</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;
