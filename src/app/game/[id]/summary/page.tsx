"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { localDb, type GameCache } from '@/lib/db';
import { Home, Download, Award, Calendar, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

// design-taste-frontend Configuration:
// DESIGN_VARIANCE: 9
// MOTION_INTENSITY: 5
// VISUAL_DENSITY: 8

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function GameSummaryPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const gameId = resolvedParams.id;

  const [mounted, setMounted] = useState(false);
  const [game, setGame] = useState<GameCache | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [systemTime, setSystemTime] = useState("");

  useEffect(() => {
    Promise.resolve().then(() => setMounted(true));

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
          colors: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6']
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      
      frame();
    };

    loadGame();
  }, [gameId, router]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Jakarta',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      };
      const formatter = new Intl.DateTimeFormat('sv-SE', options);
      setSystemTime(formatter.format(now));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted || !game) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0A0C] text-[#E2E8F0] font-mono crt-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 border-2 border-zinc-800 border-t-red-500 animate-spin rounded-none"></div>
          <span className="text-[10px] uppercase font-bold tracking-widest opacity-60">
            [ COMPILING FINAL REPORTS... ]
          </span>
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
  }).toUpperCase();

  return (
    <div className="flex min-h-screen flex-col bg-[#0A0A0C] text-[#E2E8F0] font-mono crt-screen relative overflow-x-hidden select-none pb-12">
      
      {/* Top Banner / System Telemetry Bar */}
      <header className="w-full border-b border-zinc-800 bg-[#0C0C0E]/90 backdrop-blur-sm px-6 py-3 flex flex-wrap items-center justify-between z-40 text-[11px] tracking-wider text-zinc-500">
        <div className="flex items-center gap-4">
          <span className="text-red-500 font-black tracking-widest uppercase">
            [ UNO_CORE // REPORT_MATRIX ]
          </span>
        </div>
        <div className="flex items-center gap-4 mt-1 sm:mt-0">
          <span className="uppercase">
            NET_STATUS: {isOnline ? (
              <span className="text-green-500 font-extrabold">[ ONLINE ]</span>
            ) : (
              <span className="text-red-500 font-extrabold">[ OFFLINE ]</span>
            )}
          </span>
          <span className="hidden md:inline text-zinc-600">|</span>
          <span className="text-zinc-400 font-medium">
            {systemTime}
          </span>
        </div>
      </header>

      {/* Main Grid Workspace */}
      <div className="flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-y-12 lg:gap-0 lg:divide-x lg:divide-zinc-800 border-t border-zinc-800 relative z-10">
        
        {/* Left Side: Summary Visuals & Action Blocks */}
        <section className="lg:col-span-5 p-8 flex flex-col justify-between space-y-12 min-h-full">
          <div className="space-y-8">
            
            {/* Heading block */}
            <div className="space-y-4">
              <span className="text-[10px] text-red-500 tracking-[0.25em] uppercase block font-black">
                &gt;&gt;&gt; REPORT_LOG_GENERATOR
              </span>
              <h1 className="text-5xl sm:text-6xl font-black uppercase tracking-tighter leading-[0.85] text-[#FFFFFF]">
                FINAL<br />
                STANDINGS
              </h1>
              <div className="w-16 h-1.5 bg-red-600 mt-2" />
              <p className="text-[9px] text-zinc-500 uppercase mt-2">
                DATE OF SEQUENCE: {formattedDate}
              </p>
            </div>

            {/* Visual Podium representation using block brutalist components */}
            {leaderboard.length >= 2 && (
              <div className="w-full border border-zinc-800 bg-[#0C0C0F] p-6 relative">
                <span className="text-[9px] text-zinc-500 uppercase tracking-widest block mb-4">
                  [ 01 // PODIUM GRAPHIC ]
                </span>
                
                <div className="flex items-end justify-center w-full gap-3 h-[140px] mt-2">
                  
                  {/* 2nd Place */}
                  {secondPlace && (
                    <div className="flex flex-col items-center w-20">
                      <span className="text-[9px] font-black truncate w-full text-center mb-1 text-zinc-400 uppercase">
                        {secondPlace.name}
                      </span>
                      <div className="w-full bg-[#121216] border border-zinc-800 h-[55px] flex flex-col items-center justify-center rounded-none shadow-md">
                        <span className="text-lg font-black text-zinc-400">2ND</span>
                        <span className="text-[8px] font-mono font-bold text-zinc-500">{secondPlace.totalScore} PTS</span>
                      </div>
                    </div>
                  )}

                  {/* 1st Place */}
                  {firstPlace && (
                    <div className="flex flex-col items-center w-24 relative">
                      <Sparkles className="w-4 h-4 text-red-500 absolute -top-5 animate-pulse" />
                      <span className="text-[10px] font-black truncate w-full text-center mb-1 text-red-500 uppercase">
                        {firstPlace.name}
                      </span>
                      <div className="w-full bg-[#1A0C0C] border-2 border-red-500 h-[85px] flex flex-col items-center justify-center rounded-none shadow-lg">
                        <span className="text-xl font-black text-red-500">01ST</span>
                        <span className="text-[9px] font-mono font-black text-white">{firstPlace.totalScore} PTS</span>
                      </div>
                    </div>
                  )}

                  {/* 3rd Place */}
                  {thirdPlace && (
                    <div className="flex flex-col items-center w-20">
                      <span className="text-[9px] font-black truncate w-full text-center mb-1 text-amber-600 uppercase">
                        {thirdPlace.name}
                      </span>
                      <div className="w-full bg-[#0C0C0F] border border-zinc-800 h-[40px] flex flex-col items-center justify-center rounded-none">
                        <span className="text-xs font-black text-amber-600">3RD</span>
                        <span className="text-[8px] font-mono font-bold text-zinc-500">{thirdPlace.totalScore} PTS</span>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={exportPDF}
                className="w-full flex items-center justify-center gap-1.5 bg-[#121216] border border-zinc-800 hover:bg-zinc-900 text-zinc-300 font-black py-3 text-xs tracking-widest uppercase transition-all active:translate-y-0.5 rounded-none cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                [ EXPORT REPORT PDF ]
              </button>

              <button
                onClick={() => router.push('/')}
                className="w-full flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-black py-3 text-xs tracking-widest uppercase transition-colors border-b-4 border-red-800 active:border-b-0 active:translate-y-1 rounded-none cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                [ RE-INITIALIZE TERMINAL ]
              </button>
            </div>

          </div>
        </section>

        {/* Right Side: Tabular Final Score Breakdown */}
        <section className="lg:col-span-7 p-8 flex flex-col justify-center min-h-full">
          <div className="max-w-3xl w-full mx-auto border-2 border-zinc-800 bg-[#0C0C0F] relative">
            
            {/* Tactical Grid Crosshairs */}
            <span className="absolute -top-2 -left-2 font-black text-red-500 select-none">+</span >
            <span className="absolute -top-2 -right-2 font-black text-red-500 select-none">+</span >
            <span className="absolute -bottom-3 -left-2 font-black text-red-500 select-none">+</span >
            <span className="absolute -bottom-3 -right-2 font-black text-red-500 select-none">+</span >

            {/* Header info */}
            <div className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between bg-[#0E0E12]">
              <span className="text-xs font-black uppercase tracking-widest text-[#FFFFFF]">
                [ FINAL CLASSIFICATION MATRIX ]
              </span>
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">
                ROUNDS SAVED: {game.rounds.length}
              </span>
            </div>

            <div className="p-6 space-y-4">
              <h3 className="text-xs font-black uppercase text-[#FFFFFF] tracking-wider flex items-center gap-2">
                [ DETAILED STANDINGS LOG ]
              </h3>

              <div className="space-y-2.5">
                {leaderboard.map((item, index) => {
                  const isWinner = index === 0;
                  return (
                    <div key={item.id} className={`flex items-center justify-between p-3 border
                      ${isWinner 
                        ? 'bg-[#1A0C0C] border-red-500 text-red-500 font-bold' 
                        : 'bg-[#121216] border-zinc-800'
                      }
                    `}>
                      <div className="flex items-center gap-3">
                        <span className={`flex items-center justify-center w-6 h-6 border font-black text-[10px]
                          ${index === 0 ? 'bg-red-600/20 text-red-500 border-red-500/50' : 
                            index === 1 ? 'bg-zinc-700/20 text-zinc-400 border-zinc-700/50' : 
                            index === 2 ? 'bg-amber-600/10 text-amber-500 border-amber-600/30' : 
                            'text-zinc-600 border-zinc-800'}
                        `}>
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="text-xs font-black truncate max-w-[130px] uppercase text-zinc-300">
                          {item.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-[10px] text-zinc-500 font-bold bg-[#0A0A0C] px-2 py-0.5 border border-zinc-800">
                          [ 1ST_PL: {item.rankCounts[1] || 0}X ]
                        </span>
                        <span className="text-xs font-black text-red-500 tracking-wider">
                          {item.totalScore} PTS
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
}
