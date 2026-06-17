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

const addTournamentHeaderAndInfo = (doc, tournamentSummary, completedRounds) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header Background
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.text("LAPORAN TURNAMEN UNO", 14, 22);
  
  // Subtitle
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // Slate 500
  doc.text("Dihasilkan secara otomatis oleh sistem", 14, 28);
  
  // Info Cards on Right
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  
  // Align right values
  const rightAlign = pageWidth - 14;
  
  doc.text(`Pemain:`, rightAlign - 30, 18);
  doc.text(`Babak:`, rightAlign - 30, 24);
  doc.text(`Selesai:`, rightAlign - 30, 30);
  
  doc.setFont("helvetica", "normal");
  doc.text(`${tournamentSummary.totalPlayers}`, rightAlign, 18, { align: "right" });
  doc.text(`${tournamentSummary.roundsType}`, rightAlign, 24, { align: "right" });
  doc.text(`${completedRounds}`, rightAlign, 30, { align: "right" });

  // Subtle divider
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.setLineWidth(0.5);
  doc.line(14, 40, pageWidth - 14, 40);
};

const addLeaderboard = (doc, leaderboardData) => {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text("Papan Skor Akhir", 14, 55);

  autoTable(doc, {
    startY: 60,
    head: [["Nama Pemain", "Total Skor"]],
    body: leaderboardData,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59], // Slate 800
      textColor: 255,
      fontStyle: "bold",
      halign: "left",
      font: "helvetica",
    },
    columnStyles: {
      0: { cellWidth: "auto", halign: "left", font: "helvetica" },
      1: { cellWidth: 50, halign: "center", font: "helvetica", fontStyle: "bold" },
    },
    styles: {
      cellPadding: 6,
      fontSize: 10,
      font: "helvetica",
      lineColor: [226, 232, 240], // Slate 200
      lineWidth: 0.1,
      textColor: [51, 65, 85], // Slate 700
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // Slate 50
    },
    margin: { left: 14, right: 14 },
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

const addPlayerStatisticsSectionTitle = (doc, currentY) => {
  const sectionTitle = "Statistik Juara Detail";
  const pageHeight = doc.internal.pageSize.getHeight();

  if (currentY + 50 > pageHeight - 20) {
    doc.addPage();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text(sectionTitle, 14, 20);
    return 30;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(sectionTitle, 14, currentY + 15);
  return currentY + 25;
};

const addPlayerStatistics = (doc, playerStats, totalPlayers) => {
  const currentY = doc.lastAutoTable?.finalY || 90;
  const statsYStart = addPlayerStatisticsSectionTitle(doc, currentY);

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  const gap = 10;
  const columnWidth = (pageWidth - (margin * 2) - gap) / 2;
  const rowHeight = 50;
  const pageHeight = doc.internal.pageSize.getHeight();

  let yPos = statsYStart;

  for (let i = 0; i < playerStats.length; i += 2) {
    if (yPos + rowHeight > pageHeight - 20) {
      doc.addPage();
      yPos = 20;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("Statistik Juara Detail (lanjutan)", 14, yPos);
      yPos += 15;
    }

    for (let j = 0; j < 2; j++) {
      const playerIndex = i + j;
      if (playerIndex >= playerStats.length) break;

      const player = playerStats[playerIndex];
      const xPos = margin + j * (columnWidth + gap);

      // Player Name Header for Mini Table
      doc.setFillColor(241, 245, 249); // Slate 100
      doc.rect(xPos, yPos, columnWidth, 8, 'F');
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text(player.name, xPos + 4, yPos + 5.5);

      const statsData = createPlayerStatsData(player, totalPlayers);

      autoTable(doc, {
        startY: yPos + 8,
        margin: { left: xPos },
        head: [], // No standard header row, we drew a custom block above
        body: statsData,
        tableWidth: columnWidth,
        theme: 'plain',
        columnStyles: {
          0: { halign: "left", font: "helvetica", textColor: [100, 116, 139] }, // Slate 500
          1: { halign: "right", font: "helvetica", fontStyle: "bold", textColor: [15, 23, 42] },
        },
        styles: {
          cellPadding: 3,
          fontSize: 9,
          lineColor: [241, 245, 249],
          lineWidth: { bottom: 0.1 }, // Only bottom borders
        },
      });
    }

    yPos = (doc.lastAutoTable?.finalY || yPos) + 15;
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

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);

  addTournamentHeaderAndInfo(doc, tournamentSummary, completedRounds);
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
