"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { localDb, type GameCache } from '@/lib/db';
import { ArrowLeft, Trophy, Save, RotateCcw, AlertTriangle, Play } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { CustomModal } from '@/components/modal';

// design-taste-frontend Configuration:
// DESIGN_VARIANCE: 9
// MOTION_INTENSITY: 5
// VISUAL_DENSITY: 8

interface PageProps {
  params: Promise<{ id: string }>;
}

const getTimestamp = () => Date.now();

export default function GamePage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const gameId = resolvedParams.id;

  const [mounted, setMounted] = useState(false);
  const [game, setGame] = useState<GameCache | null>(null);
  const [currentRoundNumber, setCurrentRoundNumber] = useState<number>(1);
  
  const [roundRanks, setRoundRanks] = useState<{ [rank: number]: string }>({});
  const [validationError, setValidationError] = useState<string | null>(null);
  const [savingRound, setSavingRound] = useState(false);
  const [chartReady, setChartReady] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [systemTime, setSystemTime] = useState("");

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type?: 'alert' | 'confirm';
    severity?: 'info' | 'warning' | 'error' | 'success';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const showModal = (
    title: string,
    message: string,
    onConfirm: () => void,
    type: 'alert' | 'confirm' = 'confirm',
    severity: 'info' | 'warning' | 'error' | 'success' = 'warning'
  ) => {
    setModalConfig({
      isOpen: true,
      title,
      message,
      type,
      severity,
      onConfirm: () => {
        onConfirm();
        setModalConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

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

  useEffect(() => {
    if (mounted) {
      const timer = setTimeout(() => {
        setChartReady(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [mounted]);

  useEffect(() => {
    Promise.resolve().then(() => setMounted(true));

    const loadGame = async () => {
      const data = await localDb.gamesCache.get(gameId);
      if (!data) {
        router.push('/');
        return;
      }
      setGame(data);
      
      const nextRound = data.rounds.length + 1;
      setCurrentRoundNumber(nextRound);

      const initialRanks: { [rank: number]: string } = {};
      data.players.forEach((_, idx) => {
        initialRanks[idx + 1] = '';
      });
      setRoundRanks(initialRanks);
    };

    loadGame();
  }, [gameId, router]);

  if (!mounted || !game) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0A0C] text-[#E2E8F0] font-mono crt-screen">
        <LoaderSpinner />
      </div>
    );
  }

  const N = game.totalPlayers;

  const calculatePoints = (rank: number) => {
    return N - rank + 1;
  };

  const handlePlayerChangeForRank = (rank: number, playerId: string) => {
    setRoundRanks(prev => ({
      ...prev,
      [rank]: playerId
    }));
    setValidationError(null); 
  };

  const validateRanks = (): boolean => {
    const selectedPlayerIds = Object.values(roundRanks).filter(id => id !== '');
    const uniqueIds = new Set(selectedPlayerIds);
    if (uniqueIds.size !== N || selectedPlayerIds.length !== N) {
      setValidationError("Setiap pemain harus dipilih tepat satu kali pada peringkat yang berbeda!");
      return false;
    }
    return true;
  };

  const handleSaveRound = async () => {
    if (!validateRanks()) return;

    const now = getTimestamp();
    setSavingRound(true);
    try {
      const scores: { [playerId: string]: { score: number; rank: number } } = {};
      for (let r = 1; r <= N; r++) {
        const playerId = roundRanks[r];
        scores[playerId] = {
          rank: r,
          score: calculatePoints(r)
        };
      }

      const updatedRounds = [
        ...game.rounds,
        {
          roundNumber: currentRoundNumber,
          scores
        }
      ];

      const updatedGame: GameCache = {
        ...game,
        rounds: updatedRounds
      };

      await localDb.gamesCache.put(updatedGame);
      setGame(updatedGame);

      await localDb.syncQueue.put({
        type: 'game',
        payload: updatedGame,
        createdAt: now
      });

      if (navigator.onLine) {
        import('@/lib/sync').then(m => m.syncOfflineData());
      }

      setCurrentRoundNumber(currentRoundNumber + 1);

      const nextRanks: { [rank: number]: string } = {};
      game.players.forEach((_, idx) => {
        nextRanks[idx + 1] = '';
      });
      setRoundRanks(nextRanks);

    } catch (err) {
      setValidationError("Gagal menyimpan babak.");
    } finally {
      setSavingRound(false);
    }
  };

  const handleFinishGame = async () => {
    try {
      const now = getTimestamp();
      const finalGame: GameCache = {
        ...game,
        status: 'completed'
      };

      await localDb.gamesCache.put(finalGame);
      
      await localDb.syncQueue.put({
        type: 'game',
        payload: finalGame,
        createdAt: now
      });

      if (navigator.onLine) {
        await syncOfflineDataSilently();
      }

      router.push(`/game/${gameId}/summary`);
    } catch (err) {
      showModal(
        "Gagal Menyimpan",
        "Gagal menyelesaikan permainan.",
        () => {},
        'alert',
        'error'
      );
    }
  };

  const syncOfflineDataSilently = async () => {
    try {
      const { syncOfflineData } = await import('@/lib/sync');
      await syncOfflineData();
    } catch (e) {
      // ignore offline sync errors
    }
  };

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

  const getChartData = () => {
    const data: any[] = [];
    
    const baseRound: any = { name: 'Start' };
    game.players.forEach(p => {
      baseRound[p.name] = 0;
    });
    data.push(baseRound);

    const cumulativeScores: { [playerName: string]: number } = {};
    game.players.forEach(p => {
      cumulativeScores[p.name] = 0;
    });

    game.rounds.forEach((round) => {
      const roundData: any = { name: `B${round.roundNumber}` };
      game.players.forEach((p) => {
        const scoreInfo = round.scores[p.id];
        const points = scoreInfo ? scoreInfo.score : 0;
        cumulativeScores[p.name] += points;
        roundData[p.name] = cumulativeScores[p.name];
      });
      data.push(roundData);
    });

    return data;
  };

  const chartData = getChartData();

  const colors = [
    '#EF4444', // Red
    '#10B981', // Green
    '#3B82F6', // Blue
    '#F59E0B', // Amber
    '#EC4899', // Pink
    '#8B5CF6', // Purple
    '#06B6D4', // Cyan
    '#F97316', // Orange
    '#14B8A6', // Teal
    '#6366F1', // Indigo
  ];

  const isGameOver = !game.isUnlimitedRounds && game.rounds.length >= game.totalRounds;

  return (
    <div className="flex min-h-screen flex-col bg-[#0A0A0C] text-[#E2E8F0] font-mono crt-screen relative overflow-x-hidden select-none pb-12">
      
      {/* Top Banner / System Telemetry Bar */}
      <header className="w-full border-b border-zinc-800 bg-[#0C0C0E]/90 backdrop-blur-sm px-6 py-3 flex flex-wrap items-center justify-between z-40 text-[11px] tracking-wider text-zinc-500">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              showModal(
                "Keluar Game",
                "Keluar dari game? Skor Anda akan dihapus dari lokal dan data permainan ini akan hilang.",
                async () => {
                  try {
                    await localDb.gamesCache.delete(gameId);
                    const queueItems = await localDb.syncQueue.toArray();
                    for (const item of queueItems) {
                      if (item.payload?.id === gameId) {
                        if (item.id !== undefined) {
                          await localDb.syncQueue.delete(item.id);
                        }
                      }
                    }
                    router.push('/');
                  } catch (err) {
                    router.push('/');
                  }
                },
                'confirm',
                'error'
              );
            }}
            className="flex items-center gap-1.5 text-[10px] font-black uppercase text-red-500 hover:text-red-400 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            [ ABORT_MATCH ]
          </button>
          <span className="text-zinc-700">|</span>
          <span className="text-zinc-300 font-bold uppercase">
            UNO_CORE // GAME_ACTIVE
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
        
        {/* Left Side: Game Status, Score Input Form, Standings Table */}
        <main className="lg:col-span-7 p-8 space-y-8">
          
          {/* Dashboard telemetry bar */}
          <div className="flex items-center justify-between bg-[#0E0E12] border border-zinc-800 px-5 py-4 rounded-none">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">&gt;&gt;&gt; LIVE_METRICS</p>
              <h2 className="text-lg font-black uppercase text-[#FFFFFF] mt-0.5">
                {game.isUnlimitedRounds ? `ROUND ${currentRoundNumber}` : `ROUND ${Math.min(currentRoundNumber, game.totalRounds)} OF ${game.totalRounds}`}
              </h2>
            </div>
            <div className="text-right">
              <span className={`inline-block px-3 py-1 text-[9px] font-black tracking-widest border rounded-none uppercase
                ${isGameOver 
                  ? 'bg-red-500/10 text-red-500 border-red-500/30' 
                  : 'bg-green-500/10 text-green-500 border-green-500/30'
                }
              `}>
                {isGameOver ? '[ FINALIZE READY ]' : '[ ACTIVE_SEQUENCE ]'}
              </span>
            </div>
          </div>

          {/* Active play round entry form */}
          {!isGameOver ? (
            <div className="border-2 border-zinc-800 bg-[#0C0C0F] relative p-6 space-y-5">
              <span className="absolute -top-2 -left-2 font-black text-red-500 select-none">+</span >
              <span className="absolute -top-2 -right-2 font-black text-red-500 select-none">+</span >
              <span className="absolute -bottom-3 -left-2 font-black text-red-500 select-none">+</span >
              <span className="absolute -bottom-3 -right-2 font-black text-red-500 select-none">+</span >

              <div className="space-y-1">
                <h3 className="text-sm font-black uppercase text-[#FFFFFF] tracking-wider">
                  [ RECORD SCORES FOR ROUND {currentRoundNumber} ]
                </h3>
                <p className="text-[10px] text-zinc-500 uppercase leading-relaxed">
                  ASSIGN STANDINGS RANK TO EACH PLAYER. SYSTEM COMPUTES POIN MATRIX AUTOMATICALLY (HIGHER SCORE GIVEN TO HIGHER PLACEMENT).
                </p>
              </div>

              {validationError && (
                <p className="text-[10px] font-bold text-red-500 bg-red-500/10 border border-red-500/30 px-3.5 py-2.5 rounded-none flex items-center gap-1.5 uppercase">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  {validationError}
                </p>
              )}

              <div className="space-y-2.5">
                {Array.from({ length: N }, (_, idx) => idx + 1).map((rank) => {
                  const currentSelectedPlayerId = roundRanks[rank] || '';
                  const points = calculatePoints(rank);

                  return (
                    <div key={rank} className="flex items-center justify-between bg-[#121216] p-3 border border-zinc-800">
                      <span className="text-xs font-black text-zinc-300 uppercase">
                        RANK {String(rank).padStart(2, '0')}
                      </span>
                      
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-mono text-zinc-500 bg-[#0A0A0C] px-2.5 py-1 border border-zinc-800">
                          +{points} PTS
                        </span>
                        <select
                          aria-label={`Pemain untuk peringkat ${rank}`}
                          value={currentSelectedPlayerId}
                          onChange={(e) => handlePlayerChangeForRank(rank, e.target.value)}
                          className="bg-[#0A0A0C] border border-zinc-800 rounded-none px-2.5 py-1 text-xs font-bold text-[#E2E8F0] focus:outline-none focus:border-red-500 focus:ring-0 cursor-pointer uppercase"
                        >
                          <option value="" className="bg-[#0A0A0C]">SELECT PLAYER...</option>
                          {game.players.map((p) => (
                            <option 
                              key={p.id} 
                              value={p.id}
                              disabled={Object.values(roundRanks).includes(p.id) && roundRanks[rank] !== p.id}
                              className="bg-[#0A0A0C]"
                            >
                              {p.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    const clearedRanks: { [rank: number]: string } = {};
                    game.players.forEach((_, idx) => {
                      clearedRanks[idx + 1] = '';
                    });
                    setRoundRanks(clearedRanks);
                    setValidationError(null);
                  }}
                  className="flex-1 py-3 bg-[#121216] border border-zinc-800 hover:bg-zinc-900 text-zinc-500 hover:text-zinc-300 text-xs font-black uppercase tracking-wider transition-colors rounded-none flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  [ RESET SELECTIONS ]
                </button>

                <button
                  onClick={handleSaveRound}
                  disabled={savingRound}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 disabled:bg-zinc-800 text-white font-black text-xs tracking-widest uppercase transition-colors border-b-4 border-red-800 active:border-b-0 active:translate-y-1 disabled:opacity-40 disabled:pointer-events-none rounded-none flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  [ COMMIT ROUND {currentRoundNumber} ]
                </button>
              </div>
            </div>
          ) : (
            // Finalize sequence banner
            <div className="border-2 border-red-500 bg-[#120A0A] p-6 text-center space-y-4 relative">
              <span className="absolute -top-2 -left-2 font-black text-red-500 select-none">+</span >
              <span className="absolute -top-2 -right-2 font-black text-red-500 select-none">+</span >
              <span className="absolute -bottom-3 -left-2 font-black text-red-500 select-none">+</span >
              <span className="absolute -bottom-3 -right-2 font-black text-red-500 select-none">+</span >

              <Trophy className="w-12 h-12 text-red-500 mx-auto animate-pulse" />
              <div className="space-y-1">
                <h3 className="text-sm font-black uppercase text-red-500 tracking-widest">[ MATCH COMPLETE ]</h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto uppercase">
                  ALL CONFIGURED ROUNDS COMPLETED. COMMIT DATA TO COMPUTE FINAL LEADERBOARD STANDINGS AND GENERATE REPORTS.
                </p>
              </div>
              <button
                onClick={handleFinishGame}
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-red-600 text-white font-black text-xs tracking-widest hover:bg-red-700 border-b-4 border-red-800 transition-colors uppercase rounded-none cursor-pointer"
              >
                [ GENERATE SUMMARY & REPORT ]
              </button>
            </div>
          )}

          {/* Standings Table matrix */}
          <div className="border border-zinc-800 bg-[#0C0C0F] p-6 space-y-4">
            <h3 className="text-sm font-black uppercase text-[#FFFFFF] tracking-wider flex items-center gap-2">
              [ LIVE LEADERBOARD MATRIX ]
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-[10px] font-black uppercase tracking-wider">
                    <th className="py-2.5 px-2">RANK</th>
                    <th className="py-2.5 px-2">PLAYER NAME</th>
                    <th className="py-2.5 px-2 text-right">TOTAL POINTS</th>
                    <th className="py-2.5 px-2 text-center">ROUND RECAP</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((item, index) => {
                    const rank1Count = item.rankCounts[1] || 0;
                    const rank2Count = item.rankCounts[2] || 0;
                    
                    return (
                      <tr key={item.id} className="border-b border-zinc-900 hover:bg-[#121216] transition-colors font-medium">
                        <td className="py-3.5 px-2">
                          <span className={`inline-flex items-center justify-center w-6 h-6 border font-black text-[10px]
                            ${index === 0 ? 'bg-red-600/20 text-red-500 border-red-500/50' : 
                              index === 1 ? 'bg-zinc-700/20 text-zinc-400 border-zinc-700/50' : 
                              index === 2 ? 'bg-amber-600/10 text-amber-500 border-amber-600/30' : 
                              'text-zinc-600 border-zinc-900'}
                          `}>
                            {String(index + 1).padStart(2, '0')}
                          </span>
                        </td>
                        <td className="py-3.5 px-2 truncate max-w-[130px] font-bold uppercase text-zinc-300">
                          {item.name}
                        </td>
                        <td className="py-3.5 px-2 text-right font-black text-red-500 tracking-wider">
                          {item.totalScore} PTS
                        </td>
                        <td className="py-3.5 px-2 text-center text-[10px] text-zinc-400">
                          {rank1Count > 0 && <span className="inline-block mx-0.5 px-1.5 py-0.5 bg-red-600/10 text-red-500 font-extrabold border border-red-500/20">[ 1ST: {rank1Count} ]</span>}
                          {rank2Count > 0 && <span className="inline-block mx-0.5 px-1.5 py-0.5 bg-zinc-700/10 text-zinc-400 font-extrabold border border-zinc-700/20">[ 2ND: {rank2Count} ]</span>}
                          {Object.entries(item.rankCounts).filter(([r]) => r !== '1' && r !== '2').map(([r, count]) => (
                            <span key={r} className="inline-block mx-0.5 px-1.5 py-0.5 bg-[#121216] text-zinc-500 border border-zinc-800">[ R{r}: {count} ]</span>
                          ))}
                          {Object.values(item.rankCounts).length === 0 && <span className="text-zinc-600 tracking-wide">[ NO DATA ]</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </main>

        {/* Right Side: Charts, Stats, Actions */}
        <aside className="lg:col-span-5 p-8 space-y-8">
          
          {/* Chart telemetry */}
          <div className="border border-zinc-800 bg-[#0C0C0F] p-6 space-y-4">
            <div className="space-y-1">
              <h3 className="text-xs font-black uppercase text-[#FFFFFF] tracking-wider">
                [ CUMULATIVE SCORE PLOT ]
              </h3>
              <p className="text-[9px] text-zinc-500 uppercase">
                POIN PROGRESSION CURVE PER REGISTERED PLAYER PER COMPLETED ROUND.
              </p>
            </div>

            {game.rounds.length > 0 ? (
              <div className="w-full h-[260px] mt-4 select-none font-mono text-[10px]">
                {chartReady ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="2 2" stroke="#27272a" opacity={0.3} />
                      <XAxis dataKey="name" stroke="#71717a" fontSize={9} tickLine={false} />
                      <YAxis stroke="#71717a" fontSize={9} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#0C0C0E', 
                          border: '2px solid #ef4444',
                          borderRadius: '0px',
                          color: '#E2E8F0',
                          fontSize: '10px',
                          fontFamily: 'monospace'
                        }} 
                      />
                      <Legend iconSize={6} iconType="square" wrapperStyle={{ fontSize: '9px', paddingTop: '10px' }} />
                      {game.players.map((p, idx) => (
                        <Line
                          key={p.id}
                          type="linear" // strict straight lines (tactical style)
                          dataKey={p.name}
                          stroke={colors[idx % colors.length]}
                          strokeWidth={2}
                          dot={{ r: 2, strokeWidth: 1, radius: 0 }}
                          activeDot={{ r: 4, strokeWidth: 1, radius: 0 }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-500 uppercase font-bold">
                    [ MOUNTING SCORE PLOT... ]
                  </div>
                )}
              </div>
            ) : (
              <div className="h-[200px] border border-dashed border-zinc-800 bg-[#0E0E12] flex items-center justify-center text-center text-[10px] text-zinc-500 italic p-6 uppercase">
                [ CHART PLOT WILL RENDER UPON ROUND 01 COMMISSION ]
              </div>
            )}
          </div>

          {/* Telemetry Stats */}
          <div className="border border-zinc-800 bg-[#0C0C0F] p-5 space-y-4">
            <h4 className="text-xs font-black text-zinc-400 uppercase tracking-wider">
              [ SYSTEM DATABASE SPECIFICATIONS ]
            </h4>
            <div className="grid grid-cols-2 gap-4 text-[10px] text-zinc-500 uppercase font-mono">
              <div>
                <span className="block text-zinc-600">TOTAL PLAYERS</span>
                <span className="text-xs font-bold text-zinc-300">{game.totalPlayers} REGISTERED</span>
              </div>
              <div>
                <span className="block text-zinc-600">ROUND SEQUENCE</span>
                <span className="text-xs font-bold text-zinc-300">{game.rounds.length} REGISTERED</span>
              </div>
              <div>
                <span className="block text-zinc-600">ROUND LIMIT</span>
                <span className="text-xs font-bold text-zinc-300">{game.isUnlimitedRounds ? 'FREE RUN SEQUENCE' : `${game.totalRounds} LIMIT`}</span>
              </div>
              <div>
                <span className="block text-zinc-600">MAX ROUND REWARD</span>
                <span className="text-xs font-bold text-zinc-300">+{calculatePoints(1)} PTS/ROUND</span>
              </div>
            </div>
          </div>

          {/* Danger zone actions */}
          {game.rounds.length > 0 && (
            <div className="flex gap-4">
              <button
                onClick={() => {
                  showModal(
                    "Reset Match",
                    "Reset seluruh data game ini? Semua babak terinput akan dihapus.",
                    async () => {
                      const resetGame: GameCache = {
                        ...game,
                        rounds: []
                      };
                      await localDb.gamesCache.put(resetGame);
                      setGame(resetGame);
                      setCurrentRoundNumber(1);
                      
                      const nextRanks: { [rank: number]: string } = {};
                      game.players.forEach((p, idx) => {
                        nextRanks[idx + 1] = p.id;
                      });
                      setRoundRanks(nextRanks);
                    },
                    'confirm',
                    'warning'
                  );
                }}
                className="flex-1 py-3 bg-[#121216] border border-zinc-800 hover:bg-zinc-900 text-red-500 hover:text-red-400 text-xs font-black uppercase tracking-wider transition-colors rounded-none flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                [ AORT_MATCH_DATA ]
              </button>

              {game.isUnlimitedRounds && (
                <button
                  onClick={handleFinishGame}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs tracking-widest uppercase transition-colors border-b-4 border-red-800 active:border-b-0 active:translate-y-1 rounded-none flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  [ COMMIT FINAL RESULTS ]
                </button>
              )}
            </div>
          )}

        </aside>

      </div>

      <CustomModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        severity={modalConfig.severity}
        onConfirm={modalConfig.onConfirm}
        onCancel={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
      />

    </div>
  );
}

function LoaderSpinner() {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="h-6 w-6 border-2 border-zinc-800 border-t-red-500 animate-spin rounded-none"></div>
      <span className="text-[10px] uppercase font-bold tracking-widest opacity-60">
        [ MOUNTING CORE TELEMETRY... ]
      </span>
    </div>
  );
}
