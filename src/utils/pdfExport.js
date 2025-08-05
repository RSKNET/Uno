import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Exports tournament data to PDF
 * @param {Object} tournamentData - Tournament data from the TournamentContext
 * @param {Object} tournamentSummary - Tournament summary from getTournamentSummary
 */
export const exportTournamentToPdf = (tournamentData, tournamentSummary) => {
  if (!tournamentData || !tournamentSummary) return;

  const doc = new jsPDF();

  const sortedPlayers = tournamentData.gameData?.playerScores || [];

  const playerStats =
    tournamentData.gameData?.playerScores.map((playerScore) => ({
      id: playerScore.playerIndex,
      name: tournamentSummary.players[playerScore.playerIndex],
      wins: [
        playerScore.wins?.first || 0,
        playerScore.wins?.second || 0,
        playerScore.wins?.third || 0,
        playerScore.wins?.fourth || 0,
      ],
    })) || [];

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

  doc.text(`Jumlah Pemain       : ${tournamentSummary.totalPlayers}`, 14, 45);
  doc.text(`Jumlah Babak         : ${tournamentSummary.roundsType}`, 14, 55);
  doc.text(
    `Babak Selesai         : ${tournamentData.gameData?.completedRounds || 0}`,
    14,
    65
  );

  doc.setFont("times", "bold");
  doc.text("Papan Skor", 105, 85, { align: "center" });
  doc.setFont("times", "normal");

  const leaderboardData = sortedPlayers.map((playerScore) => [
    tournamentSummary.players[playerScore.playerIndex],
    playerScore.totalScore,
    playerScore.wins?.first || 0,
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

  let statsYStart;
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

      const statsData = player.wins
        .map((count, rankIndex) => [`Juara ${rankIndex + 1}`, `${count}x`])
        .slice(0, tournamentSummary.totalPlayers);

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

  doc.save(`Laporan_Turnamen_UNO_${new Date().toISOString().slice(0, 10)}.pdf`);
};
