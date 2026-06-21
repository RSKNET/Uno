import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface GameReportData {
  id: string;
  totalPlayers: number;
  totalRounds: number;
  isUnlimitedRounds: boolean;
  createdAt: number | string;
  players: { id: string; name: string }[];
  rounds: {
    roundNumber: number;
    scores: {
      [playerId: string]: {
        score: number;
        rank: number;
      }
    };
  }[];
}

export function exportGamePdf(game: GameReportData) {
  const doc = new jsPDF();
  const N = game.totalPlayers;
  
  const leaderboard = game.players.map((p) => {
    let totalScore = 0;
    const rankCounts: { [rank: number]: number } = {};

    game.rounds.forEach((round) => {
      const playerScore = round.scores[p.id];
      if (playerScore) {
        totalScore += playerScore.score;
        rankCounts[playerScore.rank] = (rankCounts[playerScore.rank] || 0) + 1;
      }
    });

    return {
      id: p.id,
      name: p.name,
      totalScore,
      rankCounts
    };
  }).sort((a, b) => {
    const scoreDiff = b.totalScore - a.totalScore;
    if (scoreDiff !== 0) return scoreDiff;

    for (let r = 1; r <= N; r++) {
      const countA = a.rankCounts[r] || 0;
      const countB = b.rankCounts[r] || 0;
      if (countB !== countA) {
        return countB - countA;
      }
    }
    return 0;
  });

  const formattedDate = new Date(game.createdAt).toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 36, 'F');

  doc.setFillColor(244, 63, 94);
  doc.rect(0, 36, 210, 2, 'F');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('UNO SKORS MATCH REPORT', 14, 18);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text('CHAMPIONS SPECIAL EDITION', 14, 26);

  doc.setFontSize(8);
  doc.text(`Dicetak: ${new Date().toLocaleDateString('id-ID')} ${new Date().toLocaleTimeString('id-ID')}`, 196, 26, { align: 'right' });

  doc.setDrawColor(228, 228, 231);
  doc.setFillColor(250, 250, 250);
  doc.roundedRect(14, 46, 182, 26, 3, 3, 'FD');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(113, 113, 122);
  doc.text('METADATA PERTANDINGAN', 18, 52);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(39, 39, 42);
  doc.text(`ID Game: ${game.id.slice(0, 18)}...`, 18, 59);
  doc.text(`Tanggal: ${formattedDate}`, 18, 65);
  doc.text(`Babak  : ${game.rounds.length} Babak ${game.isUnlimitedRounds ? '(Bebas)' : ''}`, 130, 59);
  doc.text(`Pemain : ${game.totalPlayers} Orang`, 130, 65);

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('KLASEMEN AKHIR', 14, 82);

  let currentY = 87;
  leaderboard.forEach((item, idx) => {
    let bgColor = [255, 255, 255];
    let borderColor = [228, 228, 231];
    let textColor = [39, 39, 42];
    let badgeText = `POSISI ${idx + 1}`;
    
    if (idx === 0) {
      bgColor = [254, 243, 199];
      borderColor = [245, 158, 11];
      textColor = [120, 53, 4];
      badgeText = 'CHAMPION';
    } else if (idx === 1) {
      bgColor = [241, 245, 249];
      borderColor = [100, 116, 139];
      textColor = [15, 23, 42];
      badgeText = 'RUNNER-UP';
    } else if (idx === 2) {
      bgColor = [255, 242, 242];
      borderColor = [244, 63, 94];
      textColor = [159, 18, 57];
      badgeText = '3RD PLACE';
    }

    doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
    doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
    doc.roundedRect(14, currentY, 182, 11, 2, 2, 'FD');

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text(badgeText, 18, currentY + 7);

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text(item.name, 50, currentY + 7);

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`${item.totalScore} PTS`, 140, currentY + 7);

    const wins = item.rankCounts[1] || 0;
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(113, 113, 122);
    doc.text(`(${wins}x juara 1)`, 168, currentY + 7);

    currentY += 14;
  });

  currentY += 4;
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('REKAP PERINGKAT PER BABAK', 14, currentY);

  const detailHeaders = [
    ['Pemain', ...Array.from({ length: N }, (_, i) => `Juara ${i + 1}`)]
  ];

  const detailRows = leaderboard.map((item) => {
    const row = [item.name];
    for (let r = 1; r <= N; r++) {
      row.push(`${item.rankCounts[r] || 0}x`);
    }
    return row;
  });

  autoTable(doc, {
    head: detailHeaders,
    body: detailRows,
    startY: currentY + 4,
    styles: { 
      fontSize: 8, 
      cellPadding: 3, 
      font: 'Helvetica',
      lineColor: [244, 244, 245],
      lineWidth: 0.1
    },
    headStyles: { 
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250]
    },
    theme: 'striped',
  });

  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(244, 244, 245);
    doc.line(14, 280, 196, 280);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(161, 161, 170);
    doc.text('Generated by Uno Skors App | Keep playing, keep scoring!', 14, 286);
    doc.text(`Halaman ${i} dari ${pageCount}`, 196, 286, { align: 'right' });
  }

  doc.save(`uno_skors_${game.id.slice(0, 8)}.pdf`);
}
