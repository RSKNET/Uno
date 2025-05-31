"use client";

import React from "react";
import { jsPDF } from "jspdf";
import autoTable, { UserOptions } from "jspdf-autotable";
import styles from "../../styles/game.module.css";

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

interface PdfExportButtonProps {
  tournamentData: TournamentData | null;
  gameState: GameState;
  gameHistory: GameResult[];
}

declare module "jspdf" {
  interface jsPDF {
    lastAutoTable?: {
      finalY: number;
    };
    autoTable?: (options: UserOptions) => jsPDF;
  }
}

const PdfExportButton: React.FC<PdfExportButtonProps> = ({
  tournamentData,
  gameState,
  gameHistory,
}) => {
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

  const exportToPdf = () => {
    if (!tournamentData) return;

    const doc = new jsPDF();
    const sortedPlayers = getSortedPlayers();
    const playerStats = getPlayerStats();

    doc.setFont("times", "normal");
    doc.setFontSize(12);

    doc.setFontSize(18);
    doc.setFont("times", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("LAPORAN TURNAMEN UNO", 105, 20, { align: "center" });
    doc.setFont("times", "normal");
    doc.setFontSize(12);

    doc.setFontSize(12);
    doc.setFont("times", "bold");
    doc.text("Informasi Turnamen", 105, 35, { align: "center" });
    doc.setFont("times", "normal");

    doc.text(`Jumlah Pemain       : ${tournamentData.playerCount}`, 14, 45);
    doc.text(
      `Jumlah Babak         : ${
        tournamentData.gamesPerRound !== null
          ? tournamentData.gamesPerRound
          : "Unlimited"
      }`,
      14,
      55
    );
    doc.text(
      `Babak Selesai         : ${gameState.completedGames.length}`,
      14,
      65
    );

    doc.setFont("times", "bold");
    doc.text("Papan Skor", 105, 85, { align: "center" });
    doc.setFont("times", "normal");

    const leaderboardData = sortedPlayers.map((player) => [
      player.name,
      player.totalScore,
      player.wins,
    ]);

    autoTable(doc, {
      startY: 90,
      head: [["Nama Pemain", "Total Skor", "Kemenangan"]],
      body: leaderboardData,
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold",
        halign: "center",
        font: "times",
      },
      columnStyles: {
        0: { cellWidth: "auto", halign: "center", font: "times" },
        1: { cellWidth: "auto", halign: "center", font: "times" },
        2: { cellWidth: "auto", halign: "center", font: "times" },
      },
      styles: {
        cellPadding: 5,
        fontSize: 11,
        halign: "center",
        font: "times",
      },
      margin: { left: 14 },
    });

    const currentY = doc.lastAutoTable?.finalY || 90;
    const sectionTitle = "Statistik Juara Setiap Pemain";
    const pageHeight = doc.internal.pageSize.getHeight();

    let statsYStart: number;
    if (currentY + 50 > pageHeight - 20) {
      doc.addPage();
      doc.setFont("times", "bold");
      doc.text(sectionTitle, 105, 20, { align: "center" });
      doc.setFont("times", "normal");
      statsYStart = 30;
    } else {
      doc.setFont("times", "bold");
      doc.text(sectionTitle, 105, currentY + 20, { align: "center" });
      doc.setFont("times", "normal");
      statsYStart = currentY + 30;
    }

    const columnWidth = 60;
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = (pageWidth - (columnWidth * 2 + 10)) / 2;
    const rowHeight = 50;

    let yPos = statsYStart;
    let currentPage = 1;

    for (let i = 0; i < playerStats.length; i += 2) {
      if (yPos + rowHeight > pageHeight - 20) {
        doc.addPage();
        currentPage++;
        yPos = 20;
        doc.setFont("times", "bold");
        doc.text(`${sectionTitle} (lanjutan)`, 105, yPos, { align: "center" });
        doc.setFont("times", "normal");
        yPos += 10;
      }

      for (let j = 0; j < 2; j++) {
        const playerIndex = i + j;
        if (playerIndex >= playerStats.length) break;

        const player = playerStats[playerIndex];
        const xPos = margin + j * (columnWidth + 10);

        doc.setFontSize(12);
        doc.setFont("times", "bold");
        doc.text(player.name, xPos + columnWidth / 2, yPos, {
          align: "center",
        });
        doc.setFont("times", "normal");

        const statsData = player.wins.map((count, rankIndex) => [
          `Juara ${rankIndex + 1}`,
          `${count}x`,
        ]);

        autoTable(doc, {
          startY: yPos + 5,
          margin: { left: xPos },
          head: [["Posisi", "Jumlah"]],
          body: statsData,
          tableWidth: columnWidth,
          headStyles: {
            fillColor: [52, 152, 219],
            textColor: 255,
            fontStyle: "bold",
            halign: "center",
            font: "times",
          },
          columnStyles: {
            0: { halign: "center", font: "times" },
            1: { halign: "center", font: "times" },
          },
          styles: {
            cellPadding: 3,
            fontSize: 10,
            halign: "center",
            font: "times",
          },
        });
      }

      yPos = (doc.lastAutoTable?.finalY || yPos) + 10;
    }

    doc.save(
      `Laporan_Turnamen_UNO_${new Date().toISOString().slice(0, 10)}.pdf`
    );
  };

  return (
    <button
      onClick={exportToPdf}
      className={`${styles.btn} ${styles.btnPrimary}`}
      disabled={!tournamentData}
    >
      💾 Simpan ke PDF
    </button>
  );
};

export default PdfExportButton;
