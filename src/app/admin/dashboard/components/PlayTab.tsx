"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Play, 
  Trophy, 
  AlertTriangle, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Swords, 
  TrendingUp
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { localDb, type GameCache } from '@/lib/db';

interface PlayTabProps {
  players: { id: string; name: string }[];
  maxPlayers: number;
  unlimitedRounds: boolean;
  showModal: (
    title: string,
    message: string,
    onConfirm: () => void,
    type?: 'alert' | 'confirm',
    severity?: 'info' | 'warning' | 'error' | 'success'
  ) => void;
}

const uuidv4 = () => {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export default function PlayTab({ players, maxPlayers, unlimitedRounds, showModal }: PlayTabProps) {
  const [activeGame, setActiveGame] = useState<GameCache | null>(null);
  
  // Setup States
  const [totalPlayers, setTotalPlayers] = useState<number>(2);
  const [totalRounds, setTotalRounds] = useState<number>(5);
  const [isUnlimitedRounds, setIsUnlimitedRounds] = useState<boolean>(unlimitedRounds);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>(Array(2).fill(''));
  const [setupError, setSetupError] = useState<string | null>(null);

  // Active Game States
  const [currentRoundNumber, setCurrentRoundNumber] = useState<number>(1);
  const [roundRanks, setRoundRanks] = useState<{ [rank: number]: string }>({});
  const [scoringError, setScoringError] = useState<string | null>(null);
  const [savingRound, setSavingRound] = useState(false);
  const [chartReady, setChartReady] = useState(false);



  // Sync active game from cache on mount
  useEffect(() => {
    const loadActiveGame = async () => {
      const active = await localDb.gamesCache.where('status').equals('active').first();
      if (active) {
        setActiveGame(active);
        setCurrentRoundNumber(active.rounds.length + 1);
        
        // Initialize ranks picker
        const initialRanks: { [rank: number]: string } = {};
        active.players.forEach((_, idx) => {
          initialRanks[idx + 1] = '';
        });
        setRoundRanks(initialRanks);
      }
    };
    loadActiveGame();
  }, []);

  // Handle totalPlayers change synchronously
  const handleTotalPlayersChange = (num: number) => {
    setTotalPlayers(num);
    setSelectedPlayers(Array(num).fill(''));
    setSetupError(null);
  };

  // Handle Chart Animation Trigger
  useEffect(() => {
    if (!activeGame) return;
    const timer = setTimeout(() => setChartReady(true), 150);
    return () => {
      clearTimeout(timer);
      setChartReady(false);
    };
  }, [activeGame]);

  const handlePlayerSlotChange = (index: number, playerId: string) => {
    const updated = [...selectedPlayers];
    updated[index] = playerId;
    setSelectedPlayers(updated);
    setSetupError(null);
  };

  const handleStartGame = async () => {
    // Validation
    const filled = selectedPlayers.filter(id => id !== '');
    if (filled.length !== totalPlayers) {
      setSetupError("Semua slot pemain harus dipilih!");
      return;
    }
    const unique = new Set(filled);
    if (unique.size !== totalPlayers) {
      setSetupError("Pemain yang dipilih tidak boleh ada yang sama!");
      return;
    }

    const gameId = uuidv4();
    const gamePlayers = selectedPlayers.map(id => {
      const found = players.find(p => p.id === id);
      return { id, name: found ? found.name : 'Unknown' };
    });

    const newGame: GameCache = {
      id: gameId,
      totalPlayers,
      totalRounds: isUnlimitedRounds ? 9999 : totalRounds,
      isUnlimitedRounds,
      players: gamePlayers,
      rounds: [],
      status: 'active',
      isSynced: 0,
      createdAt: Date.now()
    };

    await localDb.gamesCache.put(newGame);
    setActiveGame(newGame);
    setCurrentRoundNumber(1);

    const initialRanks: { [rank: number]: string } = {};
    gamePlayers.forEach((_, idx) => {
      initialRanks[idx + 1] = '';
    });
    setRoundRanks(initialRanks);
    
    // Save queue
    await localDb.syncQueue.put({
      type: 'game',
      payload: newGame,
      createdAt: Date.now()
    });
  };

  // Scoring Logic
  const N = activeGame ? activeGame.totalPlayers : 0;
  
  const calculatePoints = (rank: number) => {
    return N - rank + 1;
  };

  const handleRankChange = (rank: number, playerId: string) => {
    setRoundRanks(prev => ({ ...prev, [rank]: playerId }));
    setScoringError(null);
  };

  const handleSaveRound = async () => {
    if (!activeGame) return;

    // Validation
    const chosenIds = Object.values(roundRanks).filter(id => id !== '');
    if (chosenIds.length !== N) {
      setScoringError("Semua posisi juara harus ditentukan!");
      return;
    }
    const uniqueIds = new Set(chosenIds);
    if (uniqueIds.size !== N) {
      setScoringError("Setiap pemain harus dipilih tepat satu kali pada peringkat yang berbeda!");
      return;
    }

    setSavingRound(true);
    try {
      const scores: { [playerId: string]: { score: number; rank: number } } = {};
      for (let r = 1; r <= N; r++) {
        const pId = roundRanks[r];
        scores[pId] = {
          rank: r,
          score: calculatePoints(r)
        };
      }

      const updatedRounds = [
        ...activeGame.rounds,
        {
          roundNumber: currentRoundNumber,
          scores
        }
      ];

      const updatedGame: GameCache = {
        ...activeGame,
        rounds: updatedRounds
      };

      await localDb.gamesCache.put(updatedGame);
      setActiveGame(updatedGame);

      await localDb.syncQueue.put({
        type: 'game',
        payload: updatedGame,
        createdAt: Date.now()
      });

      if (navigator.onLine) {
        import('@/lib/sync').then(m => m.syncOfflineData());
      }

      setCurrentRoundNumber(currentRoundNumber + 1);

      // Reset picker
      const nextRanks: { [rank: number]: string } = {};
      activeGame.players.forEach((_, idx) => {
        nextRanks[idx + 1] = '';
      });
      setRoundRanks(nextRanks);
    } catch {
      setScoringError("Gagal menyimpan babak permainan.");
    } finally {
      setSavingRound(false);
    }
  };

  const handleCancelGame = () => {
    showModal(
      "Batalkan Game",
      "Apakah Anda yakin ingin membatalkan game ini? Semua skor babak yang terinput akan dihapus secara permanen.",
      async () => {
        if (activeGame) {
          await localDb.gamesCache.delete(activeGame.id);
          
          // Delete from sync queue
          const queue = await localDb.syncQueue.toArray();
          for (const item of queue) {
            if (item.payload?.id === activeGame.id && item.id !== undefined) {
              await localDb.syncQueue.delete(item.id);
            }
          }
        }
        setActiveGame(null);
        setSelectedPlayers(Array(totalPlayers).fill(''));
      },
      'confirm',
      'error'
    );
  };

  const handleFinishGame = async () => {
    if (!activeGame) return;

    try {
      const finalGame: GameCache = {
        ...activeGame,
        status: 'completed'
      };

      await localDb.gamesCache.put(finalGame);
      
      await localDb.syncQueue.put({
        type: 'game',
        payload: finalGame,
        createdAt: Date.now()
      });

      if (navigator.onLine) {
        const { syncOfflineData } = await import('@/lib/sync');
        await syncOfflineData().catch(() => {});
      }

      showModal(
        "Game Selesai",
        "Permainan telah diselesaikan dan laporan skor berhasil diunggah ke database cloud.",
        () => {
          setActiveGame(null);
          setSelectedPlayers(Array(totalPlayers).fill(''));
        },
        'alert',
        'success'
      );
    } catch {
      setScoringError("Gagal menyelesaikan permainan.");
    }
  };

  // Leaderboard Calculation
  const leaderboard = useMemo(() => {
    if (!activeGame) return [];

    return activeGame.players.map(p => {
      let totalScore = 0;
      const rankCounts: { [rank: number]: number } = {};

      activeGame.rounds.forEach(round => {
        const ps = round.scores[p.id];
        if (ps) {
          totalScore += ps.score;
          rankCounts[ps.rank] = (rankCounts[ps.rank] || 0) + 1;
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
        if (countB !== countA) return countB - countA;
      }
      return 0;
    });
  }, [activeGame, N]);

  // Chart Data Calculation
  const chartData = useMemo(() => {
    if (!activeGame || activeGame.rounds.length === 0) return [];

    const data: Record<string, string | number>[] = [];
    const baseRound: Record<string, string | number> = { name: 'Start' };
    activeGame.players.forEach(p => {
      baseRound[p.name] = 0;
    });
    data.push(baseRound);

    const accum: { [name: string]: number } = {};
    activeGame.players.forEach(p => {
      accum[p.name] = 0;
    });

    activeGame.rounds.forEach(round => {
      const rData: Record<string, string | number> = { name: `B${round.roundNumber}` };
      activeGame.players.forEach(p => {
        const ps = round.scores[p.id];
        accum[p.name] += ps ? ps.score : 0;
        rData[p.name] = accum[p.name];
      });
      data.push(rData);
    });

    return data;
  }, [activeGame]);

  const colors = ['#f43f5e', '#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];
  const isGameOver = activeGame && !activeGame.isUnlimitedRounds && activeGame.rounds.length >= activeGame.totalRounds;
  const playerButtons = Array.from({ length: maxPlayers - 1 }, (_, i) => i + 2);

  return (
    <div className="space-y-6">
      {!activeGame ? (
        // GAME SETUP SCREEN
        <div className="bezel-outer max-w-xl mx-auto">
          <div className="bezel-inner p-6 sm:p-8 space-y-6">
            <h2 className="text-md font-bold flex items-center gap-2 text-zinc-200">
              <Swords className="w-5 h-5 text-rose-500" /> Pengaturan Pertandingan Baru
            </h2>

            {setupError && (
              <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{setupError}</span>
              </div>
            )}

            <div className="space-y-5">
              {/* Total Players Selector Dropdown */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Jumlah Pemain</label>
                <select
                  value={totalPlayers}
                  onChange={(e) => handleTotalPlayersChange(parseInt(e.target.value) || 2)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:border-rose-500 text-zinc-300"
                >
                  {playerButtons.map(num => (
                    <option key={num} value={num}>
                      {num} Pemain
                    </option>
                  ))}
                </select>
              </div>

              {/* Rounds limit config */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Jumlah Babak</label>
                  <input
                    type="number"
                    disabled={isUnlimitedRounds}
                    value={totalRounds}
                    onChange={(e) => setTotalRounds(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:border-rose-500 disabled:opacity-40 transition-colors"
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-3 px-3 py-3 bg-zinc-900 border border-zinc-800 rounded-xl cursor-pointer hover:bg-zinc-800 transition-colors h-[45px] select-none text-zinc-300">
                    <input
                      type="checkbox"
                      checked={isUnlimitedRounds}
                      onChange={(e) => setIsUnlimitedRounds(e.target.checked)}
                      className="rounded border-zinc-800 text-rose-600 focus:ring-rose-500 h-4 w-4 bg-zinc-950"
                    />
                    <span className="text-xs font-semibold">Babak Bebas</span>
                  </label>
                </div>
              </div>

              <div className="w-full h-px bg-zinc-800/60" />

              {/* Player Selector Dropdowns */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">Pilih Nama Pemain</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Array.from({ length: totalPlayers }).map((_, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Slot {idx + 1}</span>
                      <select
                        value={selectedPlayers[idx] || ''}
                        onChange={(e) => handlePlayerSlotChange(idx, e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:border-rose-500 text-zinc-300"
                      >
                        <option value="">Pilih Pemain...</option>
                        {players.map(p => (
                          <option 
                            key={p.id} 
                            value={p.id}
                            disabled={selectedPlayers.includes(p.id) && selectedPlayers[idx] !== p.id}
                          >
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleStartGame}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white py-3.5 text-sm font-bold transition-all shadow-lg shadow-rose-500/25 active:scale-[0.98] mt-4"
              >
                <Play className="w-4 h-4 fill-current" />
                Mulai Game
              </button>
            </div>
          </div>
        </div>
      ) : (
        // ACTIVE SCOREBOARD SCREEN
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: Scoring and Leaderboard */}
          <div className="lg:col-span-7 space-y-6">
            {/* Round info card */}
            <div className="flex items-center justify-between bg-zinc-900/40 border border-zinc-800/50 px-5 py-4 rounded-2xl">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Status Game</p>
                <h3 className="text-lg font-bold font-display mt-0.5">
                  {activeGame.isUnlimitedRounds ? `Babak ${currentRoundNumber}` : `Babak ${Math.min(currentRoundNumber, activeGame.totalRounds)} dari ${activeGame.totalRounds}`}
                </h3>
              </div>
              <div>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border
                  ${isGameOver 
                    ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
                    : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                  }
                `}>
                  {isGameOver ? 'Finalize Ready' : 'Active'}
                </span>
              </div>
            </div>

            {/* Input round scores */}
            {!isGameOver ? (
              <div className="bezel-outer">
                <div className="bezel-inner p-6 space-y-5">
                  <div>
                    <h3 className="text-md font-bold font-display flex items-center gap-2">
                      <Save className="w-4 h-4 text-rose-500" /> Catat Hasil Babak {currentRoundNumber}
                    </h3>
                    <p className="text-[11px] text-zinc-500 mt-0.5">Tentukan pemenang (Juara 1) sampai juru kunci di babak ini.</p>
                  </div>

                  {scoringError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-xl flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{scoringError}</span>
                    </div>
                  )}

                  <div className="space-y-3">
                    {Array.from({ length: N }).map((_, idx) => {
                      const rank = idx + 1;
                      const points = calculatePoints(rank);
                      return (
                        <div key={rank} className="flex items-center justify-between bg-zinc-900/30 p-3 rounded-xl border border-zinc-800/40">
                          <span className="text-xs font-bold text-gradient">Juara {rank}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-mono text-zinc-500 bg-black/30 px-2 py-1 rounded-md">
                              +{points} Poin
                            </span>
                            <select
                              value={roundRanks[rank] || ''}
                              onChange={(e) => handleRankChange(rank, e.target.value)}
                              className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs font-bold focus:outline-none focus:border-rose-500 text-zinc-300"
                            >
                              <option value="">Pilih...</option>
                              {activeGame.players.map(p => (
                                <option 
                                  key={p.id} 
                                  value={p.id}
                                  disabled={Object.values(roundRanks).includes(p.id) && roundRanks[rank] !== p.id}
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

                  <div className="flex flex-col sm:flex-row gap-2 w-full">
                    <button
                      onClick={() => {
                        const clearedRanks: { [rank: number]: string } = {};
                        activeGame.players.forEach((_, idx) => {
                          clearedRanks[idx + 1] = '';
                        });
                        setRoundRanks(clearedRanks);
                        setScoringError(null);
                      }}
                      className="flex-1 py-3 rounded-xl border border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reset Pilihan
                    </button>

                    <button
                      onClick={handleSaveRound}
                      disabled={savingRound}
                      className="flex-2 flex items-center justify-center gap-2 rounded-xl bg-rose-600 text-white py-3 px-4 text-xs font-bold transition-all hover:bg-rose-700 active:scale-[0.98] shadow-md shadow-rose-600/10"
                    >
                      <Save className="w-4 h-4" />
                      Simpan Hasil Babak {currentRoundNumber}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-2xl text-center space-y-4">
                <Trophy className="w-12 h-12 text-amber-500 mx-auto animate-bounce-short" />
                <div>
                  <h3 className="text-md font-bold font-display text-amber-400">Seluruh Babak Selesai!</h3>
                  <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
                    Batas babak tercapai. Klik tombol di bawah untuk mengakhiri pertandingan dan mengarsipkan klasemen akhir.
                  </p>
                </div>
                <button
                  onClick={handleFinishGame}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 text-black font-extrabold text-xs hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/10 active:scale-[0.98]"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Selesaikan Permainan
                </button>
              </div>
            )}

            {/* Leaderboard Klasemen */}
            <div className="bezel-outer">
              <div className="bezel-inner p-6 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400" /> Klasemen Sementara
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-500 uppercase font-bold tracking-wider">
                        <th className="py-2 px-1">Pos</th>
                        <th className="py-2 px-1">Nama</th>
                        <th className="py-2 px-1 text-right">Total Skor</th>
                        <th className="py-2 px-1 text-center">Rekap Juara</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.map((item, index) => {
                        const rank1 = item.rankCounts[1] || 0;
                        const rank2 = item.rankCounts[2] || 0;
                        return (
                          <tr key={item.id} className="border-b border-zinc-900/60 hover:bg-zinc-900/10 transition-colors font-medium">
                            <td className="py-3 px-1">
                              <span className={`inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-bold
                                ${index === 0 ? 'bg-amber-500 text-black' : index === 1 ? 'bg-zinc-300 text-black' : index === 2 ? 'bg-amber-700 text-white' : 'text-zinc-500'}
                              `}>
                                {index + 1}
                              </span>
                            </td>
                            <td className="py-3 px-1 truncate max-w-[120px] font-bold text-zinc-300">{item.name}</td>
                            <td className="py-3 px-1 text-right font-extrabold text-gradient">{item.totalScore}</td>
                            <td className="py-3 px-1 text-center text-[10px]">
                              {rank1 > 0 && <span className="inline-block mx-0.5 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 font-extrabold">🥇 {rank1}</span>}
                              {rank2 > 0 && <span className="inline-block mx-0.5 px-1.5 py-0.5 rounded bg-zinc-400/10 text-zinc-400 font-extrabold">🥈 {rank2}</span>}
                              {Object.entries(item.rankCounts).filter(([r]) => r !== '1' && r !== '2').map(([r, count]) => (
                                <span key={r} className="inline-block mx-0.5 px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500">P{r}: {count}</span>
                              ))}
                              {Object.values(item.rankCounts).length === 0 && <span className="text-[10px] text-zinc-600 italic">Belum bermain</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Scoring Trend Chart and Actions */}
          <div className="lg:col-span-5 space-y-6">
            {/* Chart Card */}
            <div className="bezel-outer">
              <div className="bezel-inner p-6 space-y-4">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-rose-500" /> Grafik Tren Skor
                  </h3>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Perkembangan total poin pemain per babak.</p>
                </div>

                {activeGame.rounds.length > 0 ? (
                  <div className="w-full h-[220px] select-none">
                    {chartReady ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1f1f23" opacity={0.3} />
                          <XAxis dataKey="name" stroke="#52525b" fontSize={9} tickLine={false} />
                          <YAxis stroke="#52525b" fontSize={9} tickLine={false} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#09090b', 
                              border: '1px solid #1f1f23',
                              borderRadius: '8px',
                              fontSize: '10px',
                              color: '#f4f4f5'
                            }} 
                          />
                          <Legend iconSize={6} iconType="circle" wrapperStyle={{ fontSize: '9px', paddingTop: '8px' }} />
                          {activeGame.players.map((p, idx) => (
                            <Line
                              key={p.id}
                              type="monotone"
                              dataKey={p.name}
                              stroke={colors[idx % colors.length]}
                              strokeWidth={1.8}
                              dot={{ r: 2 }}
                              activeDot={{ r: 4 }}
                            />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-500">
                        Memuat grafik...
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-[180px] border border-dashed border-zinc-800/80 rounded-xl flex items-center justify-center text-center text-[10px] text-zinc-500 italic p-6">
                    Grafik perkembangan akan aktif setelah babak pertama tersimpan.
                  </div>
                )}
              </div>
            </div>

            {/* Match Stats Card */}
            <div className="bg-zinc-900/10 border border-zinc-800/40 p-5 rounded-2xl space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Rangkuman Match</h4>
              <div className="grid grid-cols-2 gap-4 text-[11px] text-zinc-300">
                <div>
                  <span className="text-zinc-500 block">Total Pemain</span>
                  <span className="text-xs font-bold text-zinc-200">{activeGame.totalPlayers}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Babak Dimainkan</span>
                  <span className="text-xs font-bold text-zinc-200">{activeGame.rounds.length}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Aturan Babak</span>
                  <span className="text-xs font-bold text-zinc-200">{activeGame.isUnlimitedRounds ? 'Bebas' : `${activeGame.totalRounds} Babak`}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Skor Maks. Babak</span>
                  <span className="text-xs font-bold text-zinc-200">+{calculatePoints(1)} Poin</span>
                </div>
              </div>
            </div>

            {/* Cancel / Reset Game Buttons */}
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleCancelGame}
                className="flex-1 py-2.5 rounded-xl border border-zinc-800 hover:bg-zinc-900 text-[11px] font-bold text-zinc-400 hover:text-red-500 transition-colors flex items-center justify-center gap-1.5 active:scale-95"
              >
                <XCircle className="w-3.5 h-3.5" />
                Batalkan Game
              </button>

              {activeGame.rounds.length > 0 && (
                <button
                  onClick={() => {
                    showModal(
                      "Reset Babak",
                      "Apakah Anda yakin ingin menghapus seluruh skor babak yang terinput pada game ini?",
                      async () => {
                        const resetGame = {
                          ...activeGame,
                          rounds: []
                        };
                        await localDb.gamesCache.put(resetGame);
                        setActiveGame(resetGame);
                        setCurrentRoundNumber(1);

                        const nextRanks: { [rank: number]: string } = {};
                        activeGame.players.forEach((_, idx) => {
                          nextRanks[idx + 1] = '';
                        });
                        setRoundRanks(nextRanks);
                      },
                      'confirm',
                      'warning'
                    );
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-zinc-800 hover:bg-zinc-900 text-[11px] font-bold text-zinc-400 hover:text-zinc-200 transition-colors flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Babak
                </button>
              )}

              {activeGame.isUnlimitedRounds && activeGame.rounds.length > 0 && (
                <button
                  onClick={handleFinishGame}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 text-black font-extrabold text-[11px] hover:bg-amber-600 transition-colors flex items-center justify-center gap-1.5 active:scale-95 shadow-md shadow-amber-500/10"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Selesaikan
                </button>
              )}
            </div>
          </div>
        </div>
      )}    </div>
  );
}
