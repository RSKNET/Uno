"use client";

import { Sparkles, Loader2, Download } from 'lucide-react';

interface Game {
  id: string;
  total_players: number;
  total_rounds: number;
  is_unlimited_rounds: boolean;
  created_at: string;
}

interface GameSummaryModalProps {
  isOpen: boolean;
  selectedGame: Game | null;
  loadingSummary: boolean;
  selectedGameLeaderboard: any[];
  selectedGameReportData: any | null;
  onClose: () => void;
  onExportPdf: (data: any) => void;
}

export default function GameSummaryModal({
  isOpen,
  selectedGame,
  loadingSummary,
  selectedGameLeaderboard,
  selectedGameReportData,
  onClose,
  onExportPdf
}: GameSummaryModalProps) {
  if (!isOpen || !selectedGame) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bezel-outer max-w-2xl w-full animate-bounce-short" style={{ animationDuration: '4s' }}>
        <div className="bezel-inner p-6 space-y-6 max-h-[85vh] overflow-y-auto">
          
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h4 className="text-lg font-bold font-display flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" /> Ringkasan Pertandingan
              </h4>
              <p className="text-xs text-zinc-400">Game ID: <span className="font-mono text-rose-400 font-semibold">{selectedGame.id}</span></p>
            </div>
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl border border-zinc-800 hover:bg-zinc-900 transition-colors text-xs font-bold text-zinc-400"
            >
              Tutup
            </button>
          </div>

          {loadingSummary ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-zinc-400">
              <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
              <span className="text-xs uppercase tracking-wider opacity-60">Memuat detail ringkasan...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {selectedGameLeaderboard.length >= 2 && (
                <div className="w-full bg-zinc-900/35 border border-zinc-800/40 rounded-2xl p-4 flex flex-col items-center">
                  <div className="flex items-end justify-center w-full max-w-xs gap-2 mt-2 h-[120px]">
                    {selectedGameLeaderboard[1] && (
                      <div className="flex flex-col items-center w-20">
                        <span className="text-[10px] font-bold truncate w-full text-center mb-0.5 text-zinc-400">{selectedGameLeaderboard[1].name}</span>
                        <div className="w-full bg-zinc-900/60 border border-zinc-800 rounded-t-lg h-[50px] flex flex-col items-center justify-center shadow-md">
                          <span className="text-lg font-bold font-display text-zinc-400">2</span>
                          <span className="text-[8px] font-mono opacity-80">{selectedGameLeaderboard[1].totalScore} pts</span>
                        </div>
                      </div>
                    )}
                    {selectedGameLeaderboard[0] && (
                      <div className="flex flex-col items-center w-24 relative">
                        <Sparkles className="w-4 h-4 text-amber-400 absolute -top-5 animate-pulse" />
                        <span className="text-xs font-extrabold truncate w-full text-center mb-0.5 text-amber-500">{selectedGameLeaderboard[0].name}</span>
                        <div className="w-full bg-gradient-to-b from-amber-400 to-amber-500 dark:from-amber-500/80 dark:to-amber-600/60 border-t border-x border-amber-300 dark:border-amber-500/30 rounded-t-lg h-[80px] flex flex-col items-center justify-center shadow-lg shadow-amber-500/10">
                          <span className="text-xl font-extrabold font-display text-white dark:text-zinc-900">1</span>
                          <span className="text-[9px] font-mono font-bold text-white dark:text-zinc-900">{selectedGameLeaderboard[0].totalScore} pts</span>
                        </div>
                      </div>
                    )}
                    {selectedGameLeaderboard[2] && (
                      <div className="flex flex-col items-center w-20">
                        <span className="text-[10px] font-bold truncate w-full text-center mb-0.5 text-amber-700">{selectedGameLeaderboard[2].name}</span>
                        <div className="w-full bg-zinc-900/60 border border-zinc-800 rounded-t-lg h-[35px] flex flex-col items-center justify-center shadow-sm">
                          <span className="text-lg font-bold font-display text-amber-700">3</span>
                          <span className="text-[8px] font-mono opacity-80">{selectedGameLeaderboard[2].totalScore} pts</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div className="space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Klasemen Akhir</h5>
                <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                  {selectedGameLeaderboard.map((item, index) => {
                    const isWinner = index === 0;
                    return (
                      <div key={item.id} className={`flex items-center justify-between p-2.5 rounded-xl border
                        ${isWinner 
                          ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 font-bold' 
                          : 'bg-zinc-900/30 border-zinc-800/40 text-zinc-300'
                        }
                      `}>
                        <div className="flex items-center gap-2.5">
                          <span className={`flex items-center justify-center w-5 h-5 rounded-md text-[10px] font-bold
                            ${index === 0 ? 'bg-amber-500 text-black' : index === 1 ? 'bg-zinc-300 text-black' : index === 2 ? 'bg-amber-700 text-white' : 'bg-zinc-800 text-zinc-500'}
                          `}>
                            {index + 1}
                          </span>
                          <span className="text-xs font-semibold truncate">{item.name}</span>
                        </div>

                        <div className="flex flex-col items-end gap-1 text-right shrink-0">
                          <span className="text-xs font-mono font-extrabold">{item.totalScore} pts</span>
                          <div className="flex flex-wrap gap-1 justify-end max-w-[280px]">
                            {Array.from({ length: selectedGameLeaderboard.length }, (_, i) => i + 1).map((rank) => {
                              const count = item.rankCounts[rank] || 0;
                              const rankIcons: { [r: number]: string } = { 1: '🥇', 2: '🥈', 3: '🥉' };
                              const badgeLabel = rankIcons[rank] || `#${rank}`;
                              return (
                                <span key={rank} className="text-[9px] px-1 py-0.5 rounded bg-zinc-800/80 text-zinc-400 border border-zinc-800/20 font-medium">
                                  {badgeLabel}: <span className="font-bold text-zinc-200">{count}x</span>
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => selectedGameReportData && onExportPdf(selectedGameReportData)}
                  disabled={!selectedGameReportData}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 disabled:opacity-50 text-black font-extrabold text-xs transition-colors shadow-md active:scale-95 border border-zinc-200"
                >
                  <Download className="w-3.5 h-3.5" />
                  Unduh Laporan PDF
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
