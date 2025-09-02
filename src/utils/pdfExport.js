import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const createPlayerStats = (playerScores, players) => {
  return playerScores.map((playerScore) => ({
    id: playerScore.playerIndex,
    name: players[playerScore.playerIndex],
    wins: playerScore.wins || {},
  }));
};

const createLeaderboardData = (playerScores, players) => {
  return playerScores.map((playerScore) => [
    players[playerScore.playerIndex],
    playerScore.totalScore,
  ]);
};

const addTournamentHeader = (doc) => {
  doc.setFont("times", "bold");
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text("TURNAMEN UNO", 105, 20, { align: "center" });
};

const addTournamentInfo = (doc, tournamentSummary, completedRounds) => {
  doc.setFont("times", "bold");
  doc.setFontSize(12);
  doc.text("Informasi Turnamen", 105, 35, { align: "center" });
  doc.setFont("times", "normal");

  doc.text(`Jumlah Pemain       : ${tournamentSummary.totalPlayers}`, 14, 45);
  doc.text(`Jumlah Babak         : ${tournamentSummary.roundsType}`, 14, 55);
  doc.text(`Babak Selesai         : ${completedRounds}`, 14, 65);
};

const addLeaderboard = (doc, leaderboardData) => {
  doc.setFont("times", "bold");
  doc.text("Papan Skor", 105, 85, { align: "center" });

  autoTable(doc, {
    startY: 90,
    head: [["Nama Pemain", "Total Skor"]],
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
    },
    styles: {
      cellPadding: 5,
      fontSize: 11,
      halign: "center",
      font: "times",
    },
    margin: { left: 14 },
  });
};

const getPositionLabel = (position, totalPlayers) => {
  if (position === 1) return "Juara 1";
  if (position === 2) return "Juara 2";
  if (position === 3) return "Juara 3";
  if (position === totalPlayers) return "Terakhir";
  return `Posisi ${position}`;
};

const createPlayerStatsData = (player, totalPlayers) => {
  const statsData = [];
  for (let i = 1; i <= totalPlayers; i++) {
    const positionKey = `position${i}`;
    const count = player.wins[positionKey] || 0;
    const label = getPositionLabel(i, totalPlayers);
    statsData.push([label, `${count}x`]);
  }
  return statsData;
};

const addPlayerStatisticsSection = (doc, currentY) => {
  const sectionTitle = "Statistik Juara Setiap Pemain";
  const pageHeight = doc.internal.pageSize.getHeight();

  if (currentY + 50 > pageHeight - 20) {
    doc.addPage();
    doc.setFont("times", "bold");
    doc.text(sectionTitle, 105, 20, { align: "center" });
    return 30;
  }

  doc.setFont("times", "bold");
  doc.text(sectionTitle, 105, currentY + 20, { align: "center" });
  return currentY + 30;
};

const addPlayerStatistics = (doc, playerStats, totalPlayers) => {
  const currentY = doc.lastAutoTable?.finalY || 90;
  const statsYStart = addPlayerStatisticsSection(doc, currentY);

  const columnWidth = 60;
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = (pageWidth - (columnWidth * 2 + 10)) / 2;
  const rowHeight = 50;
  const pageHeight = doc.internal.pageSize.getHeight();

  let yPos = statsYStart;

  for (let i = 0; i < playerStats.length; i += 2) {
    if (yPos + rowHeight > pageHeight - 20) {
      doc.addPage();
      yPos = 20;
      doc.setFont("times", "bold");
      doc.text("Statistik Juara Setiap Pemain (lanjutan)", 105, yPos, {
        align: "center",
      });
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
      doc.text(player.name, xPos + columnWidth / 2, yPos, { align: "center" });
      doc.setFont("times", "normal");

      const statsData = createPlayerStatsData(player, totalPlayers);

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
};

const generateFileName = (tournamentSummary, tournamentData) => {
  const dateStr = new Date().toISOString().split("T")[0];
  const tournamentId = tournamentSummary?.id || tournamentData?.id || "";
  const shortId = tournamentId ? tournamentId.substring(0, 8) : "";

  return shortId
    ? `Turnamen-UNO-${dateStr}-${shortId}.pdf`
    : `Turnamen-UNO-${dateStr}.pdf`;
};

export const generateTournamentPdf = (tournamentData, tournamentSummary) => {
  if (!tournamentData || !tournamentSummary) return null;

  const doc = new jsPDF();
  const playerScores = tournamentData.gameData?.playerScores || [];
  const completedRounds = tournamentData.gameData?.completedRounds || 0;

  const playerStats = createPlayerStats(
    playerScores,
    tournamentSummary.players
  );
  const leaderboardData = createLeaderboardData(
    playerScores,
    tournamentSummary.players
  );

  doc.setFont("times", "normal");
  doc.setFontSize(12);

  addTournamentHeader(doc);
  addTournamentInfo(doc, tournamentSummary, completedRounds);
  addLeaderboard(doc, leaderboardData);
  addPlayerStatistics(doc, playerStats, tournamentSummary.totalPlayers);

  return doc;
};

export const exportTournamentToPdf = (tournamentData, tournamentSummary) => {
  const doc = generateTournamentPdf(tournamentData, tournamentSummary);
  if (!doc) return;

  const filename = generateFileName(tournamentSummary, tournamentData);
  doc.save(filename);
};
