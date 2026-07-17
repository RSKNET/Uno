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
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full border-2 border-zinc-800 bg-[#0C0C0F] relative p-6 space-y-6 max-h-[85vh] overflow-y-auto rounded-none font-mono">
        
        {/* Tactical Grid Crosshairs */}
        <span className="absolute -top-2 -left-2 font-black text-red-500 select-none">+</span >
        <span className="absolute -top-2 -right-2 font-black text-red-500 select-none">+</span >
        <span className="absolute -bottom-3 -left-2 font-black text-red-500 select-none">+</span >
        <span className="absolute -bottom-3 -right-2 font-black text-red-500 select-none">+</span >

        <div className="flex justify-between items-start border-b border-zinc-800 pb-3">
          <div className="space-y-1">
            <h4 className="text-sm font-black uppercase tracking-widest text-[#FFFFFF] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-red-500 animate-pulse shrink-0" /> [ MATCH ARCHIVE OVERVIEW ]
            </h4>
            <p className="text-[10px] text-zinc-500 uppercase">
              GAME ID: <span className="font-mono text-red-500 font-semibold">{selectedGame.id.toUpperCase()}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 transition-colors text-[10px] font-black text-zinc-400 rounded-none uppercase cursor-pointer"
          >
            [ CLOSE ]
          </button>
        </div>

        {loadingSummary ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2 text-zinc-400">
            <Loader2 className="w-6 h-6 animate-spin text-red-500" />
            <span className="text-[10px] uppercase tracking-wider font-bold opacity-60">[ COMPILING SUMMARIES... ]</span>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Visual Podium representation using block components */}
            {selectedGameLeaderboard.length >= 2 && (
              <div className="w-full bg-[#121216]/50 border border-zinc-800 p-4 flex flex-col items-center">
                <div className="flex items-end justify-center w-full max-w-xs gap-3 mt-2 h-[120px]">
                  
                  {/* 2nd Place */}
                  {selectedGameLeaderboard[1] && (
                    <div className="flex flex-col items-center w-20">
                      <span className="text-[9px] font-black truncate w-full text-center mb-0.5 text-zinc-400 uppercase">
                        {selectedGameLeaderboard[1].name}
                      </span>
                      <div className="w-full bg-[#0C0C0F]/80 border border-zinc-800 h-[50px] flex flex-col items-center justify-center rounded-none shadow-md">
                        <span className="text-lg font-black text-zinc-400">2ND</span>
                        <span className="text-[8px] font-mono text-zinc-500">{selectedGameLeaderboard[1].totalScore} PTS</span>
                      </div>
                    </div>
                  )}

                  {/* 1st Place */}
                  {selectedGameLeaderboard[0] && (
                    <div className="flex flex-col items-center w-24 relative">
                      <Sparkles className="w-4 h-4 text-red-500 absolute -top-5 animate-pulse" />
                      <span className="text-[10px] font-black truncate w-full text-center mb-0.5 text-red-500 uppercase">
                        {selectedGameLeaderboard[0].name}
                      </span>
                      <div className="w-full bg-[#1A0C0C] border-2 border-red-500 h-[80px] flex flex-col items-center justify-center rounded-none shadow-lg">
                        <span className="text-xl font-black text-red-500">01ST</span>
                        <span className="text-[9px] font-mono font-black text-white">{selectedGameLeaderboard[0].totalScore} PTS</span>
                      </div>
                    </div>
                  )}

                  {/* 3rd Place */}
                  {selectedGameLeaderboard[2] && (
                    <div className="flex flex-col items-center w-20">
                      <span className="text-[9px] font-black truncate w-full text-center mb-0.5 text-amber-600 uppercase">
                        {selectedGameLeaderboard[2].name}
                      </span>
                      <div className="w-full bg-[#0C0C0F]/80 border border-zinc-800 h-[35px] flex flex-col items-center justify-center rounded-none shadow-sm">
                        <span className="text-sm font-black text-amber-600">3RD</span>
                        <span className="text-[8px] font-mono text-zinc-500">{selectedGameLeaderboard[2].totalScore} PTS</span>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* Classification Log List */}
            <div className="space-y-3">
              <h5 className="text-[10px] font-black uppercase tracking-wider text-zinc-500">[ FINAL CLASSIFICATION LOGS ]</h5>
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {selectedGameLeaderboard.map((item, index) => {
                  const isWinner = index === 0;
                  return (
                    <div key={item.id} className={`flex items-center justify-between p-2.5 border rounded-none
                      ${isWinner 
                        ? 'bg-[#1A0C0C] border-red-500 text-red-500 font-bold' 
                        : 'bg-[#121216] border-zinc-800 text-zinc-300'
                      }
                    `}>
                      <div className="flex items-center gap-2.5">
                        <span className={`flex items-center justify-center w-5 h-5 border font-black text-[9px]
                          ${index === 0 ? 'bg-red-600/20 text-red-500 border-red-500/40' : 
                            index === 1 ? 'bg-zinc-700/20 text-zinc-400 border-zinc-700/40' : 
                            index === 2 ? 'bg-amber-800/20 text-amber-600 border-amber-800/40' : 
                            'text-zinc-500 border-zinc-800'}
                        `}>
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="text-xs font-black truncate uppercase">{item.name}</span>
                      </div>

                      <div className="flex flex-col items-end gap-1 text-right shrink-0">
                        <span className="text-xs font-black text-red-500 tracking-wider">{item.totalScore} PTS</span>
                        <div className="flex flex-wrap gap-1 justify-end max-w-[280px]">
                          {Array.from({ length: selectedGameLeaderboard.length }, (_, i) => i + 1).map((rank) => {
                            const count = item.rankCounts[rank] || 0;
                            const rankIcons: { [r: number]: string } = { 1: '🥇', 2: '🥈', 3: '🥉' };
                            const badgeLabel = rankIcons[rank] || `R${rank}`;
                            return (
                              <span key={rank} className="text-[9px] px-1 py-0.5 bg-[#0A0A0C] border border-zinc-800 text-zinc-500 font-bold uppercase rounded-none">
                                {badgeLabel}: <span className="font-extrabold text-zinc-300">{count}X</span>
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
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 disabled:opacity-50 text-black font-black text-xs uppercase tracking-widest transition-colors shadow-md active:translate-y-0.5 rounded-none cursor-pointer border border-zinc-200"
              >
                <Download className="w-3.5 h-3.5" />
                [ UNDUH REPORT PDF ]
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
