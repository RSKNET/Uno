"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { localDb, type GameCache } from '@/lib/db';
import { ArrowLeft, Trophy, Plus, Save, CheckCircle2, RotateCcw, AlertTriangle } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { CustomModal } from '@/components/modal';

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
      data.players.forEach((p, idx) => {
        initialRanks[idx + 1] = p.id;
      });
      setRoundRanks(initialRanks);
    };

    loadGame();
  }, [gameId, router]);

  if (!mounted || !game) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-400">
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
      game.players.forEach((p, idx) => {
        nextRanks[idx + 1] = p.id;
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
    '#f43f5e', 
    '#0ea5e9', 
    '#10b981', 
    '#f59e0b', 
    '#8b5cf6', 
    '#ec4899', 
    '#14b8a6', 
    '#f97316', 
    '#a855f7', 
    '#6366f1', 
  ];

  const isGameOver = !game.isUnlimitedRounds && game.rounds.length >= game.totalRounds;

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-[#050505] text-zinc-950 dark:text-zinc-50 relative pb-12 transition-colors duration-500 overflow-x-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-rose-500/5 blur-[120px] pointer-events-none dark:block hidden" />
      <header className="sticky top-0 w-full flex items-center justify-between px-6 py-4 z-40 backdrop-blur-md bg-transparent">
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
          className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Home
        </button>

        <span className="font-display font-extrabold tracking-tight text-base text-zinc-950 dark:text-zinc-50">
          Match Board
        </span>

        <div className="w-12 h-6" /> {}
      </header>
      <div className="w-full max-w-[98%] mx-auto px-4 md:px-10 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        <main className="lg:col-span-7 space-y-8">
          <div className="flex items-center justify-between bg-zinc-100 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-800/30 px-5 py-4 rounded-2xl">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Status Game</p>
              <h2 className="text-xl font-bold font-display mt-0.5">
                {game.isUnlimitedRounds ? `Babak ${currentRoundNumber}` : `Babak ${Math.min(currentRoundNumber, game.totalRounds)} dari ${game.totalRounds}`}
              </h2>
            </div>

            <div className="text-right">
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border
                ${isGameOver 
                  ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
                  : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                }
              `}>
                {isGameOver ? 'Finalize Ready' : 'Match Active'}
              </span>
            </div>
          </div>
          {!isGameOver ? (
            <div className="bezel-outer">
              <div className="bezel-inner p-6 space-y-5">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold font-display flex items-center gap-2">
                    <Plus className="w-5 h-5 text-rose-500" /> Catat Skor Babak {currentRoundNumber}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Pilih peringkat setiap pemain untuk babak ini. Skor/poin otomatis dikalkulasikan berdasarkan peringkat (Juara 1 mendapat poin tertinggi).
                  </p>
                </div>

                {validationError && (
                  <p className="text-xs font-semibold text-red-500 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-xl flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    {validationError}
                  </p>
                )}
                <div className="space-y-3.5">
                  {Array.from({ length: N }, (_, idx) => idx + 1).map((rank) => {
                    const currentSelectedPlayerId = roundRanks[rank] || '';
                    const points = calculatePoints(rank);

                    return (
                      <div key={rank} className="flex items-center justify-between bg-zinc-100/50 dark:bg-zinc-900/30 p-3 rounded-xl border border-zinc-200/40 dark:border-zinc-800/40">
                        <span className="text-sm font-bold text-gradient">Juara {rank}</span>
                        
                        <div className="flex items-center gap-4">
                          <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500 bg-black/5 dark:bg-black/30 px-2 py-1 rounded-md">
                            +{points} poin
                          </span>
                          <select
                            value={currentSelectedPlayerId}
                            onChange={(e) => handlePlayerChangeForRank(rank, e.target.value)}
                            className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1 text-sm font-bold focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                          >
                            <option value="">Pilih Pemain...</option>
                            {game.players.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={handleSaveRound}
                  disabled={savingRound}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-rose-500 dark:bg-rose-600 text-white py-3 text-sm font-bold transition-all hover:bg-rose-600 dark:hover:bg-rose-700 shadow-md shadow-rose-500/10 active:scale-[0.98]"
                >
                  <Save className="w-4 h-4" />
                  Simpan Babak {currentRoundNumber}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-2xl text-center space-y-4">
              <Trophy className="w-12 h-12 text-amber-500 mx-auto animate-bounce-short" />
              <div className="space-y-1">
                <h3 className="text-lg font-bold font-display text-amber-400">Match Selesai!</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                  Semua babak telah dimainkan. Selesaikan permainan untuk melihat hasil klasemen akhir dan mengunduh laporan PDF.
                </p>
              </div>
              <button
                onClick={handleFinishGame}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 text-black font-extrabold text-sm hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/10 active:scale-[0.98]"
              >
                <CheckCircle2 className="w-4 h-4" />
                Selesaikan Permainan
              </button>
            </div>
          )}
          <div className="bezel-outer">
            <div className="bezel-inner p-6 space-y-4">
              <h3 className="text-lg font-bold font-display flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" /> Klasemen Sementara
              </h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 text-xs font-bold uppercase tracking-wider">
                      <th className="py-2.5 px-2">Pos</th>
                      <th className="py-2.5 px-2">Nama</th>
                      <th className="py-2.5 px-2 text-right">Skor Total</th>
                      <th className="py-2.5 px-2 text-center">Rekap Posisi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((item, index) => {
                      
                      const rank1Count = item.rankCounts[1] || 0;
                      const rank2Count = item.rankCounts[2] || 0;
                      
                      return (
                        <tr key={item.id} className="border-b border-zinc-100 dark:border-zinc-900/60 hover:bg-zinc-100/30 dark:hover:bg-zinc-900/20 transition-colors font-medium">
                          <td className="py-3.5 px-2">
                            <span className={`inline-flex items-center justify-center w-5 h-5 rounded-md text-xs font-bold
                              ${index === 0 ? 'bg-amber-500 text-black' : index === 1 ? 'bg-zinc-300 text-black' : index === 2 ? 'bg-amber-700 text-white' : 'text-zinc-400'}
                            `}>
                              {index + 1}
                            </span>
                          </td>
                          <td className="py-3.5 px-2 truncate max-w-[130px] font-semibold">{item.name}</td>
                          <td className="py-3.5 px-2 text-right font-bold text-gradient">{item.totalScore}</td>
                          <td className="py-3.5 px-2 text-center text-xs text-zinc-400">
                            {rank1Count > 0 && <span className="inline-block mx-0.5 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 font-extrabold text-[10px]">🥇 {rank1Count}</span>}
                            {rank2Count > 0 && <span className="inline-block mx-0.5 px-1.5 py-0.5 rounded bg-zinc-400/10 text-zinc-400 font-extrabold text-[10px]">🥈 {rank2Count}</span>}
                            {Object.entries(item.rankCounts).filter(([r]) => r !== '1' && r !== '2').map(([r, count]) => (
                              <span key={r} className="inline-block mx-0.5 px-1.5 py-0.5 rounded bg-zinc-800/40 text-zinc-500 text-[10px]">P{r}: {count}</span>
                            ))}
                            {Object.values(item.rankCounts).length === 0 && <span className="text-[10px] text-zinc-500 italic">Belum main</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </main>
        <aside className="lg:col-span-5 space-y-8">
          <div className="bezel-outer">
            <div className="bezel-inner p-6 space-y-4">
              <div className="space-y-1">
                <h3 className="text-base font-bold font-display">Grafik Perkembangan Skor</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Perkembangan total poin pemain di setiap babak.</p>
              </div>

              {game.rounds.length > 0 ? (
                <div className="w-full h-[260px] mt-4 select-none">
                  {chartReady ? (
                    <ResponsiveContainer width="99%" aspect={1.8} minHeight={200}>
                      <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.2} />
                        <XAxis dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} />
                        <YAxis stroke="#71717a" fontSize={10} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#0c0c0e', 
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '12px',
                            color: '#fafafa',
                            fontSize: '11px'
                          }} 
                        />
                        <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                        {game.players.map((p, idx) => (
                          <Line
                            key={p.id}
                            type="monotone"
                            dataKey={p.name}
                            stroke={colors[idx % colors.length]}
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            activeDot={{ r: 5 }}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-zinc-500">
                      Memuat grafik...
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-[200px] border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-center justify-center text-center text-xs text-zinc-500 italic p-6">
                  Grafik akan muncul setelah babak pertama disimpan.
                </div>
              )}
            </div>
          </div>
          <div className="bg-zinc-900/20 border border-zinc-200/50 dark:border-zinc-800/40 p-5 rounded-2xl space-y-4 text-xs">
            <h4 className="font-bold text-zinc-400 uppercase tracking-wider">Statistik Game</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-zinc-500 block">Total Pemain</span>
                <span className="text-sm font-bold">{game.totalPlayers}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Rounds Played</span>
                <span className="text-sm font-bold">{game.rounds.length}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Batas Babak</span>
                <span className="text-sm font-bold">{game.isUnlimitedRounds ? 'Tanpa batas (Bebas)' : `${game.totalRounds} Babak`}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Poin Maks. Babak</span>
                <span className="text-sm font-bold">+{calculatePoints(1)} poin</span>
              </div>
            </div>
          </div>
          {game.rounds.length > 0 && (
            <div className="flex gap-2">
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
                className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900/50 transition-colors text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-200"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Match
              </button>

              {game.isUnlimitedRounds && (
                <button
                  onClick={handleFinishGame}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 text-black hover:bg-amber-600 transition-colors text-xs font-extrabold flex items-center justify-center gap-1.5 active:scale-95 shadow-md shadow-amber-500/10"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Selesaikan
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
    <div className="flex flex-col items-center gap-2">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-800 border-t-zinc-400"></div>
      <span className="text-xs uppercase tracking-wider opacity-60">Memuat Permainan...</span>
    </div>
  );
}
