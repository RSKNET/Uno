"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { localDb, type GameCache } from '@/lib/db';
import { Home, Download, Award, Calendar, BarChart2, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function GameSummaryPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const gameId = resolvedParams.id;

  const [mounted, setMounted] = useState(false);
  const [game, setGame] = useState<GameCache | null>(null);

  useEffect(() => {
    setMounted(true);

    const loadGame = async () => {
      const data = await localDb.gamesCache.get(gameId);
      if (!data) {
        router.push('/');
        return;
      }
      setGame(data);

      
      const duration = 3 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#f43f5e', '#f59e0b', '#10b981', '#0ea5e9']
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#f43f5e', '#f59e0b', '#10b981', '#0ea5e9']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      
      frame();
    };

    loadGame();
  }, [gameId, router]);

  if (!mounted || !game) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-400">
        <div className="flex flex-col items-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-800 border-t-zinc-400"></div>
          <span className="text-xs uppercase tracking-wider opacity-60">Memuat Hasil...</span>
        </div>
      </div>
    );
  }

  const N = game.totalPlayers;

  
  const getLeaderboard = () => {
    return game.players.map((p) => {
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
  };

  const leaderboard = getLeaderboard();
  const firstPlace = leaderboard[0];
  const secondPlace = leaderboard[1];
  const thirdPlace = leaderboard[2];
  const otherPlaces = leaderboard.slice(3);

  
  const exportPDF = async () => {
    if (!game) return;
    const { exportGamePdf } = await import('@/lib/pdf-template');
    exportGamePdf(game);
  };

  const formattedDate = new Date(game.createdAt).toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-[#050505] text-zinc-950 dark:text-zinc-50 relative pb-6 justify-center transition-colors duration-500 overflow-x-hidden">
      
      
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[70%] h-[40%] rounded-full bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-teal-500/10 blur-[140px] pointer-events-none" />

      
      <main className="w-full max-w-[98%] mx-auto px-4 mt-6 flex flex-col items-center">
        
        
        <div className="text-center space-y-1 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/15 text-amber-500 dark:text-amber-400 border border-amber-500/20 text-[9px] font-bold tracking-widest uppercase font-display">
            <Award className="w-3 w-3" />
            Game Over
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight font-display text-gradient">
            Hasil Pertandingan
          </h2>
          <div className="flex items-center gap-1.1 text-[10px] text-zinc-500 justify-center">
            <Calendar className="w-3 h-3" />
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* Responsive Grid for Widescreen */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 w-full items-start mt-4">
          
          {/* Left Panel: Visual Podium Stack & Action Buttons (cols-5) */}
          <div className="md:col-span-5 space-y-4">
            {leaderboard.length >= 2 && (
              <div className="w-full bg-zinc-100/50 dark:bg-zinc-900/20 border border-zinc-200/50 dark:border-zinc-800/40 rounded-2xl p-4 flex flex-col items-center">
                {/* Podium heights: 1st in center, 2nd on left, 3rd on right */}
                <div className="flex items-end justify-center w-full max-w-xs gap-2 mt-2 h-[120px]">
                  {/* 2nd Place (Left) */}
                  {secondPlace && (
                    <div className="flex flex-col items-center w-20">
                      <span className="text-[10px] font-bold truncate w-full text-center mb-0.5 text-zinc-400">{secondPlace.name}</span>
                      <div className="w-full bg-zinc-200 dark:bg-zinc-800 border-t border-x border-zinc-300 dark:border-zinc-700/60 rounded-t-lg h-[50px] flex flex-col items-center justify-center shadow-md">
                        <span className="text-lg font-bold font-display text-zinc-400">2</span>
                        <span className="text-[8px] font-mono opacity-80">{secondPlace.totalScore} pts</span>
                      </div>
                    </div>
                  )}

                  {/* 1st Place (Center) */}
                  {firstPlace && (
                    <div className="flex flex-col items-center w-24 relative">
                      <Sparkles className="w-4 h-4 text-amber-400 absolute -top-5 animate-pulse" />
                      <span className="text-xs font-extrabold truncate w-full text-center mb-0.5 text-amber-500">{firstPlace.name}</span>
                      <div className="w-full bg-gradient-to-b from-amber-400 to-amber-500 dark:from-amber-500/80 dark:to-amber-600/60 border-t border-x border-amber-300 dark:border-amber-500/30 rounded-t-lg h-[80px] flex flex-col items-center justify-center shadow-lg shadow-amber-500/10">
                        <span className="text-xl font-extrabold font-display text-white dark:text-zinc-900">1</span>
                        <span className="text-[9px] font-mono font-bold text-white dark:text-zinc-900">{firstPlace.totalScore} pts</span>
                      </div>
                    </div>
                  )}

                  {/* 3rd Place (Right) */}
                  {thirdPlace && (
                    <div className="flex flex-col items-center w-20">
                      <span className="text-[10px] font-bold truncate w-full text-center mb-0.5 text-amber-700">{thirdPlace.name}</span>
                      <div className="w-full bg-zinc-200 dark:bg-zinc-800 border-t border-x border-zinc-300 dark:border-zinc-700/60 rounded-t-lg h-[35px] flex flex-col items-center justify-center shadow-sm">
                        <span className="text-lg font-bold font-display text-amber-700">3</span>
                        <span className="text-[8px] font-mono opacity-80">{thirdPlace.totalScore} pts</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="w-full grid grid-cols-2 gap-3">
              <button
                onClick={exportPDF}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-black py-2.5 text-xs font-bold transition-all shadow-md active:scale-95 border border-zinc-800 dark:border-zinc-200"
              >
                <Download className="w-3.5 h-3.5" />
                Unduh PDF
              </button>

              <button
                onClick={() => router.push('/')}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white py-2.5 text-xs font-bold transition-all shadow-lg shadow-rose-500/20 active:scale-95"
              >
                <Home className="w-3.5 h-3.5" />
                Main Lagi
              </button>
            </div>
          </div>

          {/* Right Panel: Standings & Score Details Card (cols-7) */}
          <div className="md:col-span-7">
            <div className="bezel-outer w-full">
              <div className="bezel-inner p-4 space-y-3">
                <h3 className="text-sm font-bold font-display flex items-center gap-2">
                  <BarChart2 className="w-3.5 h-3.5 text-rose-500" /> Hasil Akhir Skor
                </h3>

                <div className="space-y-1.5">
                  {leaderboard.map((item, index) => {
                    const isWinner = index === 0;
                    return (
                      <div key={item.id} className={`flex items-center justify-between p-2 rounded-xl border
                        ${isWinner 
                          ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400 font-bold' 
                          : 'bg-zinc-100/50 dark:bg-zinc-900/30 border-zinc-200/40 dark:border-zinc-800/40'
                        }
                      `}>
                        <div className="flex items-center gap-2.5">
                          <span className={`flex items-center justify-center w-5 h-5 rounded-md text-[10px] font-bold
                            ${index === 0 ? 'bg-amber-500 text-black' : index === 1 ? 'bg-zinc-300 text-black' : index === 2 ? 'bg-amber-700 text-white' : 'bg-zinc-200/60 dark:bg-zinc-800/80 text-zinc-500'}
                          `}>
                            {index + 1}
                          </span>
                          <span className="text-xs font-semibold truncate max-w-[130px]">{item.name}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-zinc-400 font-medium">
                            🥇 {item.rankCounts[1] || 0}x
                          </span>
                          <span className="text-xs font-mono font-extrabold">{item.totalScore} pts</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
