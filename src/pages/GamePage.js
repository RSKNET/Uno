import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Navbar from "@/components/Navbar";
import Notification from "@/components/Notification";
import ConfirmationModal from "@/components/ConfirmationModal";
import Loading from "@/components/Loading";
import { useTournament } from "@/context/TournamentContext";
import useMaintenance from "@/hooks/useMaintenance";
import styles from "@/styles/pages/GamePage.module.css";
import NoTournamentSetup from "@/pages/NoTournamentSetup";
import { generateTournamentPdf } from "@/utils/pdfExport";

const GamePage = () => {
  const router = useRouter();
  const {
    tournamentData,
    getTournamentSummary,
    saveRoundResult,
    resetTournamentData,
    clearAllData,
  } = useTournament();

  const { isLoading: isMaintenanceLoading } = useMaintenance();

  const [tournamentSummary, setTournamentSummary] = useState(null);
  const [selectedRankings, setSelectedRankings] = useState({});
  const [notification, setNotification] = useState(null);
  const [modals, setModals] = useState({
    reset: false,
    delete: false,
  });
  const [loadingStates, setLoadingStates] = useState({
    submitting: false,
    resetting: false,
    deleting: false,
    exportingPdf: false,
    message: "",
  });

  useEffect(() => {
    const loadTournamentSummary = async () => {
      setLoadingStates((prev) => ({
        ...prev,
        message: "Memuat data turnamen...",
      }));
      try {
        const summary = await getTournamentSummary();
        setTournamentSummary(summary);
      } catch {
        setTournamentSummary({
          id: tournamentData.id,
          totalPlayers: tournamentData.playerCount,
          roundsType: tournamentData.rounds
            ? `${tournamentData.rounds} babak`
            : "Unlimited",
          players: tournamentData.playerNames,
          isValid: tournamentData.isSetup && tournamentData.playerCount >= 2,
          createdDate: tournamentData.createdAt
            ? new Date(tournamentData.createdAt).toLocaleDateString("id-ID")
            : null,
        });
      } finally {
        setLoadingStates((prev) => ({ ...prev, message: "" }));
      }
    };

    if (tournamentData.isSetup) {
      loadTournamentSummary();
    }
  }, [tournamentData, getTournamentSummary]);

  const showNotification = useCallback((message, type = "success") => {
    setNotification({ message, type });
  }, []);

  const closeNotification = useCallback(() => {
    setNotification(null);
  }, []);

  const isTournamentCompleted = useCallback(() => {
    if (!tournamentSummary) return false;
    const rounds = tournamentData.rounds;
    return (
      rounds &&
      rounds !== "unlimited" &&
      tournamentData.gameData?.completedRounds >= parseInt(rounds, 10)
    );
  }, [tournamentSummary, tournamentData]);

  const handleModalToggle = useCallback((modalType, isOpen) => {
    setModals((prev) => ({ ...prev, [modalType]: isOpen }));
  }, []);

  const handleDeleteAndGoHome = async () => {
    handleModalToggle("delete", false);
    setLoadingStates((prev) => ({
      ...prev,
      deleting: true,
      message: "Menghapus data tournament...",
    }));

    try {
      await clearAllData();
      showNotification("Tournament berhasil dihapus!", "success");
      router.push("/");
    } catch {
      showNotification("Terjadi kesalahan saat menghapus tournament", "error");
    } finally {
      setLoadingStates((prev) => ({ ...prev, deleting: false, message: "" }));
    }
  };

  const handleRankingChange = useCallback((rank, playerIndex) => {
    const value = playerIndex === "" ? "" : parseInt(playerIndex);
    setSelectedRankings((prev) => ({ ...prev, [rank]: value }));
  }, []);

  const handleSubmitRound = async (e) => {
    e.preventDefault();
    setLoadingStates((prev) => ({
      ...prev,
      submitting: true,
      message: "Menyimpan hasil babak...",
    }));

    try {
      const totalPlayers = tournamentSummary.totalPlayers;
      const rankings = Array.from(
        { length: totalPlayers },
        (_, i) => selectedRankings[i + 1]
      );

      await saveRoundResult(rankings);
      setSelectedRankings({});
      showNotification("Hasil babak berhasil disimpan!", "success");
    } catch {
      showNotification("Terjadi kesalahan saat menyimpan hasil babak", "error");
    } finally {
      setLoadingStates((prev) => ({ ...prev, submitting: false, message: "" }));
    }
  };

  const handleResetTournament = async () => {
    handleModalToggle("reset", false);
    setLoadingStates((prev) => ({
      ...prev,
      resetting: true,
      message: "Mereset tournament...",
    }));

    try {
      await resetTournamentData();
      setSelectedRankings({});
      showNotification("Tournament berhasil direset!", "info");
    } catch {
      showNotification("Terjadi kesalahan saat reset tournament", "error");
    } finally {
      setLoadingStates((prev) => ({ ...prev, resetting: false, message: "" }));
    }
  };

  const handleExportToPdf = async () => {
    setLoadingStates((prev) => ({
      ...prev,
      exportingPdf: true,
      message: "Mengekspor tournament ke PDF...",
    }));

    try {
      const pdfDoc = generateTournamentPdf(tournamentData, tournamentSummary);
      if (!pdfDoc) {
        throw new Error("Gagal membuat PDF");
      }

      const dateStr = new Date().toISOString().split("T")[0];
      const tournamentId = tournamentSummary?.id || tournamentData.id || "";
      const shortId = tournamentId ? tournamentId.substring(0, 8) : "";
      const filename = shortId
        ? `Turnamen-UNO-${dateStr}-${shortId}.pdf`
        : `Turnamen-UNO-${dateStr}.pdf`;
      pdfDoc.save(filename);

      setLoadingStates((prev) => ({
        ...prev,
        message: "Menyimpan history...",
      }));

      await saveToHistory(pdfDoc);

      showNotification("PDF berhasil diekspor!", "success");
    } catch (error) {
      showNotification("Terjadi kesalahan saat mengekspor PDF", "error");
    } finally {
      setLoadingStates((prev) => ({
        ...prev,
        exportingPdf: false,
        message: "",
      }));
    }
  };

  const saveToHistory = async (pdfDoc) => {
    try {
      const pdfBlob = pdfDoc.output("blob");
      const pdfBuffer = await blobToBase64(pdfBlob);

      const historyData = {
        tournamentInfo: {
          title: "TURNAMEN UNO",
          totalPlayers: tournamentSummary.totalPlayers,
          roundsType: tournamentSummary.roundsType,
          completedRounds: tournamentData.gameData?.completedRounds || 0,
        },
        leaderboard:
          tournamentData.gameData?.playerScores?.map((playerScore) => ({
            playerName: tournamentSummary.players[playerScore.playerIndex],
            totalScore: playerScore.totalScore,
          })) || [],
        playerStatistics:
          tournamentData.gameData?.playerScores?.map((playerScore) => {
            const statsData = [];
            for (let i = 1; i <= tournamentSummary.totalPlayers; i++) {
              const positionKey = `position${i}`;
              const count = playerScore.wins[positionKey] || 0;
              const label =
                i === 1
                  ? "Juara 1"
                  : i === 2
                  ? "Juara 2"
                  : i === 3
                  ? "Juara 3"
                  : i === tournamentSummary.totalPlayers
                  ? "Terakhir"
                  : `Posisi ${i}`;
              statsData.push({
                position: label,
                count: count,
              });
            }

            return {
              playerName: tournamentSummary.players[playerScore.playerIndex],
              positionHistory: statsData,
            };
          }) || [],
        metadata: {
          tournamentId: tournamentSummary.id || tournamentData.id,
          timestamp: new Date().toISOString(),
          exportedAt: new Date().toISOString(),
        },
        pdfBuffer: pdfBuffer,
      };

      const response = await fetch("/api/history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(historyData),
      });

      if (!response.ok) {
        throw new Error("Failed to save history");
      }
    } catch (error) {
      throw error;
    }
  };

  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.split(",")[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const createRankingArray = useCallback((totalPlayers) => {
    return Array.from({ length: totalPlayers }, (_, index) => index + 1);
  }, []);

  const getRankingLabel = useCallback((rank, totalPlayers) => {
    if (rank === 1) return "Juara 1";
    if (rank === 2) return "Juara 2";
    if (rank === 3) return "Juara 3";
    if (rank === totalPlayers) return "Terakhir";
    return `Posisi ${rank}`;
  }, []);

  const calculatePlayerStats = useCallback((player, playerCount) => {
    let weighted = 0,
      totalPositionSum = 0,
      totalGames = 0;

    for (let pos = 1; pos <= playerCount; pos++) {
      const posKey = `position${pos}`;
      const count = player.wins?.[posKey] || 0;
      const weight = playerCount - pos + 1;
      weighted += count * weight;
      totalPositionSum += count * pos;
      totalGames += count;
    }

    return {
      weightedScore: weighted,
      averagePosition: totalGames > 0 ? totalPositionSum / totalGames : 0,
    };
  }, []);

  const getLeaderboardData = useCallback(() => {
    const playerScores = tournamentData.gameData?.playerScores || [];
    const groupedByPosition = [];
    let currentPosition = 1;

    for (let i = 0; i < playerScores.length; i++) {
      const currentPlayer = playerScores[i];
      const tiedPlayers = [currentPlayer];
      let j = i + 1;

      while (
        j < playerScores.length &&
        playerScores[j].totalScore === currentPlayer.totalScore
      ) {
        const currentStats = calculatePlayerStats(
          currentPlayer,
          tournamentSummary.totalPlayers
        );
        const nextStats = calculatePlayerStats(
          playerScores[j],
          tournamentSummary.totalPlayers
        );

        if (
          currentStats.weightedScore === nextStats.weightedScore &&
          currentStats.averagePosition === nextStats.averagePosition
        ) {
          tiedPlayers.push(playerScores[j]);
          j++;
        } else {
          break;
        }
      }

      const playerNames = tiedPlayers.map(
        (player) => tournamentSummary.players[player.playerIndex]
      );
      const displayName =
        tiedPlayers.length > 1
          ? playerNames.join(" & ")
          : tournamentSummary.players[currentPlayer.playerIndex];

      groupedByPosition.push({
        position: currentPosition,
        displayName,
        totalScore: currentPlayer.totalScore,
        isTied: tiedPlayers.length > 1,
      });

      currentPosition += tiedPlayers.length;
      i = j - 1;
    }

    return groupedByPosition;
  }, [
    tournamentData.gameData?.playerScores,
    tournamentSummary,
    calculatePlayerStats,
  ]);

  const isLoading =
    loadingStates.submitting ||
    loadingStates.resetting ||
    loadingStates.exportingPdf ||
    loadingStates.deleting ||
    !tournamentSummary;

  if (!tournamentSummary) {
    return (
      <div className={styles.gameContainer}>
        <Navbar />
        <Loading message={loadingStates.message || "Memuat data turnamen..."} />
      </div>
    );
  }

  return (
    <div className={styles.gameContainer}>
      <Navbar />

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={closeNotification}
          duration={4000}
        />
      )}

      <ConfirmationModal
        isOpen={modals.reset}
        title="Reset Tournament"
        message="Apakah Anda yakin ingin reset tournament? Semua data akan hilang."
        confirmText="Ya, Reset"
        cancelText="Batal"
        onConfirm={handleResetTournament}
        onClose={() => handleModalToggle("reset", false)}
        type="danger"
      />

      <ConfirmationModal
        isOpen={modals.delete}
        title="Hapus Tournament"
        message="Apakah Anda yakin ingin menghapus tournament dan kembali ke halaman utama? Semua data pemain, skor, dan babak akan hilang permanen."
        confirmText="Ya, Hapus & Keluar"
        cancelText="Batal"
        onConfirm={handleDeleteAndGoHome}
        onClose={() => handleModalToggle("delete", false)}
        type="danger"
      />

      <Loading
        isVisible={isLoading || isMaintenanceLoading}
        message={
          isMaintenanceLoading
            ? "Memeriksa status sistem..."
            : loadingStates.message
        }
      />

      {!tournamentSummary.isValid ? (
        <div className={styles.mainContainer}>
          <NoTournamentSetup />
        </div>
      ) : (
        <div className={styles.mainContainer}>
          <div className={styles.contentContainer}>
            <div className={styles.leftSection}>
              <div className={styles.infoContainer}>
                <h3>📋 Informasi Tournamen</h3>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <div className={styles.infoLabel}>Jumlah Pemain</div>
                    <div className={styles.infoValue}>
                      {tournamentSummary.totalPlayers}
                    </div>
                  </div>
                  <div className={styles.infoItem}>
                    <div className={styles.infoLabel}>Jumlah Babak</div>
                    <div className={styles.infoValue}>
                      {tournamentSummary.roundsType}
                    </div>
                  </div>
                  <div className={styles.infoItem}>
                    <div className={styles.infoLabel}>Babak Selesai</div>
                    <div className={styles.infoValue}>
                      {tournamentData.gameData?.completedRounds || 0}
                    </div>
                  </div>
                </div>
                <div className={styles.buttonGroup}>
                  <button
                    className={`${styles.btn} ${styles.btnPdf}`}
                    onClick={handleExportToPdf}
                    disabled={isLoading}
                  >
                    {loadingStates.exportingPdf
                      ? "📄 Mengekspor..."
                      : "📄 Simpan ke PDF"}
                  </button>
                  <button
                    className={`${styles.btn} ${styles.btnDanger}`}
                    onClick={() => handleModalToggle("reset", true)}
                    disabled={isLoading}
                  >
                    {loadingStates.resetting
                      ? "🔄 Mereset..."
                      : "🔄 Reset Tournamen"}
                  </button>
                  <button
                    className={`${styles.btn} ${styles.btnWarning}`}
                    onClick={() => handleModalToggle("delete", true)}
                    disabled={isLoading}
                  >
                    {loadingStates.deleting
                      ? "🏠 Menghapus..."
                      : "🏠 Hapus & Keluar"}
                  </button>
                </div>
              </div>

              <div className={styles.scoreSection}>
                <div className={styles.formContainer}>
                  <div className={styles.formSection}>
                    <h3>➕ Tambah Poin Kemenangan</h3>
                    <div className={styles.currentRound}>
                      {isTournamentCompleted() ? (
                        <span className={styles.tournamentCompleted}>
                          Turnamen Selesai
                        </span>
                      ) : (
                        <>Babak {tournamentData.gameData?.currentRound || 1}</>
                      )}
                    </div>

                    {isTournamentCompleted() ? (
                      <div className={styles.tournamentCompletedMessage}>
                        <p>
                          Turnamen telah mencapai jumlah babak maksimum yang
                          ditentukan.
                        </p>
                        <p>
                          Anda dapat melihat hasil akhir pada Papan Skor dan
                          Statistik Pemain.
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmitRound}>
                        <div className={styles.formGroup}>
                          <label>
                            Urutan Juara (dari Juara 1 sampai terakhir):
                          </label>
                          <div className={styles.rankingContainer}>
                            {createRankingArray(
                              tournamentSummary.totalPlayers
                            ).map((rank) => (
                              <div key={rank} className={styles.rankItem}>
                                <div className={styles.rankNumber}>{rank}</div>
                                <div className={styles.rankPlayer}>
                                  <select
                                    name={`rank${rank}`}
                                    required
                                    value={selectedRankings[rank] ?? ""}
                                    onChange={(e) =>
                                      handleRankingChange(rank, e.target.value)
                                    }
                                    className={styles.rankSelect}
                                    disabled={isLoading}
                                  >
                                    <option value="">
                                      Pilih Pemain{" "}
                                      {getRankingLabel(
                                        rank,
                                        tournamentSummary.totalPlayers
                                      )}
                                    </option>
                                    {tournamentSummary.players.map(
                                      (player, index) => {
                                        const isAlreadySelected =
                                          Object.entries(selectedRankings).some(
                                            ([selectedRank, selectedIndex]) =>
                                              selectedRank !==
                                                rank.toString() &&
                                              selectedIndex === index
                                          );

                                        return (
                                          <option
                                            key={index}
                                            value={index}
                                            disabled={isAlreadySelected}
                                            className={
                                              isAlreadySelected
                                                ? styles.disabledOption
                                                : ""
                                            }
                                          >
                                            {player}{" "}
                                            {isAlreadySelected
                                              ? "(Sudah dipilih)"
                                              : ""}
                                          </option>
                                        );
                                      }
                                    )}
                                  </select>
                                </div>
                                <div className={styles.rankScore}>
                                  +
                                  {Math.max(
                                    0,
                                    tournamentSummary.totalPlayers - rank
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <button
                          type="submit"
                          className={styles.btn}
                          disabled={isLoading}
                        >
                          {loadingStates.submitting
                            ? "Menyimpan..."
                            : "Simpan Hasil Babak"}
                        </button>
                      </form>
                    )}
                  </div>
                </div>

                <div className={styles.leaderboardContainer}>
                  <div className={styles.leaderboard}>
                    <h3>🏆 Papan Skor</h3>
                    <div className={styles.leaderboardGrid}>
                      {getLeaderboardData().map((entry, index) => (
                        <div key={index} className={styles.playerScore}>
                          <div className={styles.playerInfo}>
                            <div className={styles.playerName}>
                              {entry.position === 1 && "🥇 "}
                              {entry.position === 2 && "🥈 "}
                              {entry.position === 3 && "🥉 "}
                              {entry.position > 3 && `${entry.position}. `}
                              {entry.displayName}
                              {entry.isTied && " (Seri)"}
                            </div>
                          </div>
                          <div className={styles.playerTotalScore}>
                            {entry.totalScore}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.winnerStats}>
                <h3>📊 Statistik Pemain</h3>
                <div className={styles.statsGrid}>
                  {(tournamentData.gameData?.playerScores || []).map(
                    (playerScore) => {
                      const playerName =
                        tournamentSummary.players[playerScore.playerIndex];
                      return (
                        <div
                          key={playerScore.playerIndex}
                          className={styles.playerStats}
                        >
                          <h4>{playerName}</h4>
                          {createRankingArray(
                            tournamentSummary.totalPlayers
                          ).map((rank) => (
                            <div key={rank} className={styles.statItem}>
                              <span className={styles.statLabel}>
                                {getRankingLabel(
                                  rank,
                                  tournamentSummary.totalPlayers
                                )}
                                :
                              </span>
                              <span className={styles.statValue}>
                                {playerScore.wins?.[`position${rank}`] || 0}x
                              </span>
                            </div>
                          ))}
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            </div>

            <div className={styles.rightSection}>
              <div className={styles.historyContainer}>
                <div className={styles.historySection}>
                  <h3>📚 Riwayat Babak</h3>
                  <div className={styles.historyList}>
                    {tournamentData.gameData?.roundHistory?.length > 0 ? (
                      [...tournamentData.gameData.roundHistory]
                        .reverse()
                        .map((round) => (
                          <div key={round.round} className={styles.historyItem}>
                            <div className={styles.historyHeader}>
                              <h4>Babak {round.round}</h4>
                              <div className={styles.historyTimestamp}>
                                {new Date(round.timestamp).toLocaleDateString(
                                  "id-ID",
                                  {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </div>
                            </div>
                            <div className={styles.historyRankings}>
                              {round.rankings.map((ranking) => {
                                const playerName =
                                  tournamentSummary.players[
                                    ranking.playerIndex
                                  ];
                                return (
                                  <div
                                    key={ranking.playerIndex}
                                    className={styles.historyRank}
                                  >
                                    <div className={styles.historyRankLeft}>
                                      <div className={styles.historyPosition}>
                                        {ranking.rank}
                                      </div>
                                      <div className={styles.historyPlayer}>
                                        {playerName}
                                      </div>
                                    </div>
                                    <div className={styles.historyPoints}>
                                      +{ranking.points} poin
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className={styles.noHistoryMessage}>
                        Belum ada riwayat babak
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GamePage;
