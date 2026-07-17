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
      setSetupError("SEMUA SLOT PEMAIN HARUS DIPILIH!");
      return;
    }
    const unique = new Set(filled);
    if (unique.size !== totalPlayers) {
      setSetupError("PEMAIN YANG DIPILIH TIDAK BOLEH ADA YANG SAMA!");
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
      setScoringError("SEMUA POSISI JUARA HARUS DITENTUKAN!");
      return;
    }
    const uniqueIds = new Set(chosenIds);
    if (uniqueIds.size !== N) {
      setScoringError("SETIAP PEMAIN HARUS DIPILIH TEPAT SATU KALI PADA PERINGKAT YANG BERBEDA!");
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
      setScoringError("GAGAL MENYIMPAN BABAK PERMAINAN.");
    } finally {
      setSavingRound(false);
    }
  };

  const handleCancelGame = () => {
    showModal(
      "BATALKAN GAME",
      "APAKAH ANDA YAKIN INGIN MEMBATALKAN GAME INI? SEMUA SKOR BABAK YANG TERINPUT AKAN DIHAPUS SECARA PERMANEN.",
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
        "GAME SELESAI",
        "PERMAINAN TELAH DISELESAIKAN DAN LAPORAN SKOR BERHASIL DIUNGGAH KE DATABASE CLOUD.",
        () => {
          setActiveGame(null);
          setSelectedPlayers(Array(totalPlayers).fill(''));
        },
        'alert',
        'success'
      );
    } catch {
      setScoringError("GAGAL MENYELESAIKAN PERMAINAN.");
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

  const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];
  const isGameOver = activeGame && !activeGame.isUnlimitedRounds && activeGame.rounds.length >= activeGame.totalRounds;
  const playerButtons = Array.from({ length: maxPlayers - 1 }, (_, i) => i + 2);

  return (
    <div className="space-y-6 select-none font-mono text-[#E2E8F0] w-full">
      {!activeGame ? (
        // GAME SETUP SCREEN
        <div className="max-w-2xl border-2 border-zinc-800 bg-[#0C0C0F] relative p-6 sm:p-8 space-y-6 rounded-none">
          <span className="absolute -top-2 -left-2 font-black text-red-500 select-none">+</span >
          <span className="absolute -top-2 -right-2 font-black text-red-500 select-none">+</span >
          <span className="absolute -bottom-3 -left-2 font-black text-red-500 select-none">+</span >
          <span className="absolute -bottom-3 -right-2 font-black text-red-500 select-none">+</span >

          <div className="border-b border-zinc-800 pb-4">
            <h2 className="text-sm font-black uppercase tracking-widest text-[#FFFFFF] flex items-center gap-2">
              <Swords className="w-5 h-5 text-red-500" /> [ INITIATE NEW MATCH SEQUENCE ]
            </h2>
            <p className="text-[10px] text-zinc-500 uppercase mt-1">
              CONFIGURE ACTIVE PLAYER SLOTS AND SPECIFY SEQUENCE BOUNDARIES.
            </p>
          </div>

          {setupError && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-[10px] font-bold uppercase text-center flex items-center justify-center gap-1.5 rounded-none">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{setupError}</span>
            </div>
          )}

          <div className="space-y-5">
            {/* Total Players Selector Dropdown */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block">[ PLAYERS_MATRIX_COUNT ]</label>
              <select
                value={totalPlayers}
                onChange={(e) => handleTotalPlayersChange(parseInt(e.target.value) || 2)}
                className="w-full bg-[#121216] border border-zinc-800 px-3 py-2.5 text-xs font-bold focus:outline-none focus:border-red-500 text-zinc-300 rounded-none uppercase"
              >
                {playerButtons.map(num => (
                  <option key={num} value={num}>
                    {num} PLAYERS
                  </option>
                ))}
              </select>
            </div>

            {/* Rounds limit config */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block">[ SEQUENCE_LIMIT ]</label>
                <input
                  type="number"
                  disabled={isUnlimitedRounds}
                  value={totalRounds}
                  onChange={(e) => setTotalRounds(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-[#121216] border border-zinc-800 px-3 py-2 text-xs font-bold focus:outline-none focus:border-red-500 disabled:opacity-40 transition-colors text-zinc-300 rounded-none"
                />
              </div>
              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-3 px-3 py-2 bg-[#121216] border border-zinc-800 cursor-pointer hover:bg-zinc-900 transition-colors h-[42px] select-none text-zinc-300 rounded-none">
                  <input
                    type="checkbox"
                    checked={isUnlimitedRounds}
                    onChange={(e) => setIsUnlimitedRounds(e.target.checked)}
                    className="rounded-none border-zinc-800 text-red-600 focus:ring-red-500 h-4 w-4 bg-zinc-950"
                  />
                  <span className="text-[10px] font-black uppercase">UNLIMITED ROUNDS</span>
                </label>
              </div>
            </div>

            <div className="w-full h-px bg-zinc-800" />

            {/* Player Selector Dropdowns */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block">[ DESIGNATE PLAYER IDENTITIES ]</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Array.from({ length: totalPlayers }).map((_, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">SLOT {String(idx + 1).padStart(2, '0')}</span>
                    <select
                      value={selectedPlayers[idx] || ''}
                      onChange={(e) => handlePlayerSlotChange(idx, e.target.value)}
                      className="w-full bg-[#121216] border border-zinc-800 px-3 py-2 text-xs font-bold focus:outline-none focus:border-red-500 text-zinc-300 rounded-none uppercase"
                    >
                      <option value="">SELECT PLAYER...</option>
                      {players.map(p => (
                        <option 
                          key={p.id} 
                          value={p.id}
                          disabled={selectedPlayers.includes(p.id) && selectedPlayers[idx] !== p.id}
                        >
                          {p.name.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleStartGame}
              className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-black py-3.5 text-xs tracking-widest uppercase transition-colors border-b-4 border-red-800 active:border-b-0 active:translate-y-0.5 rounded-none cursor-pointer mt-4"
            >
              <Play className="w-4 h-4 fill-current shrink-0" />
              [ INITIATE MATCH MATRIX ]
            </button>
          </div>
        </div>
      ) : (
        // ACTIVE SCOREBOARD SCREEN
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Scoring and Leaderboard */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Round info status */}
            <div className="flex items-center justify-between bg-[#0C0C0F] border border-zinc-800 px-5 py-4 rounded-none">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">SYSTEM SEQUENCE STATUS</p>
                <h3 className="text-sm font-black uppercase text-[#FFFFFF] mt-1">
                  {activeGame.isUnlimitedRounds ? `ROUND ${currentRoundNumber}` : `ROUND ${Math.min(currentRoundNumber, activeGame.totalRounds)} OF ${activeGame.totalRounds}`}
                </h3>
              </div>
              <div>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-none text-[9px] font-black uppercase tracking-wider border
                  ${isGameOver 
                    ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' 
                    : 'bg-red-500/10 text-red-500 border-red-500/30'
                  }
                `}>
                  {isGameOver ? '[ FINALIZE_READY ]' : '[ ACTIVE_RUNNING ]'}
                </span>
              </div>
            </div>

            {/* Input round scores */}
            {!isGameOver ? (
              <div className="border border-zinc-800 bg-[#0C0C0F] p-6 space-y-5 rounded-none">
                <div>
                  <h3 className="text-xs font-black uppercase text-[#FFFFFF] tracking-wider flex items-center gap-2">
                    <Save className="w-4 h-4 text-red-500" />
                    [ RECORD ROUND {currentRoundNumber} SCORE MATRIX ]
                  </h3>
                  <p className="text-[10px] text-zinc-500 uppercase mt-1">
                    DESIGNATE FINISH RANKS FOR ACTIVE PLAYERS IN THIS CURRENT SEQUENCE.
                  </p>
                </div>

                {scoringError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-[10px] font-bold uppercase text-center flex items-center justify-center gap-1.5 rounded-none">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{scoringError}</span>
                  </div>
                )}

                <div className="space-y-3">
                  {Array.from({ length: N }).map((_, idx) => {
                    const rank = idx + 1;
                    const points = calculatePoints(rank);
                    return (
                      <div key={rank} className="flex items-center justify-between bg-[#121216] p-3 border border-zinc-800/60 rounded-none">
                        <span className="text-xs font-black uppercase text-red-500">RANK {String(rank).padStart(2, '0')}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-[9px] font-mono font-bold text-zinc-500 bg-[#0A0A0C] px-2 py-0.5 border border-zinc-800">
                            +{points} PTS
                          </span>
                          <select
                            value={roundRanks[rank] || ''}
                            onChange={(e) => handleRankChange(rank, e.target.value)}
                            className="bg-[#0A0A0C] border border-zinc-800 px-2.5 py-1 text-xs font-bold focus:outline-none focus:border-red-500 text-zinc-300 rounded-none uppercase"
                          >
                            <option value="">SELECT...</option>
                            {activeGame.players.map(p => (
                              <option 
                                key={p.id} 
                                value={p.id}
                                disabled={Object.values(roundRanks).includes(p.id) && roundRanks[rank] !== p.id}
                              >
                                {p.name.toUpperCase()}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <button
                    onClick={() => {
                      const clearedRanks: { [rank: number]: string } = {};
                      activeGame.players.forEach((_, idx) => {
                        clearedRanks[idx + 1] = '';
                      });
                      setRoundRanks(clearedRanks);
                      setScoringError(null);
                    }}
                    className="flex-1 py-3 bg-[#121216] border border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 text-xs font-black uppercase tracking-wider transition-colors rounded-none flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                    [ RESET SELECTIONS ]
                  </button>

                  <button
                    onClick={handleSaveRound}
                    disabled={savingRound}
                    className="flex-2 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3 px-4 text-xs font-black uppercase tracking-wider transition-colors border-b-4 border-red-800 active:border-b-0 active:translate-y-0.5 rounded-none cursor-pointer"
                  >
                    <Save className="w-4 h-4 shrink-0" />
                    [ COMMIT ROUND {currentRoundNumber} ]
                  </button>
                </div>
              </div>
            ) : (
              <div className="border border-amber-500 bg-[#1A140C] p-6 space-y-4 rounded-none text-center">
                <Trophy className="w-12 h-12 text-amber-500 mx-auto animate-pulse" />
                <div className="space-y-1">
                  <h3 className="text-sm font-black uppercase text-amber-400">[ ALL SEQUENCE LIMITS MET ]</h3>
                  <p className="text-[10px] text-zinc-400 max-w-xs mx-auto uppercase leading-relaxed">
                    SEQUENCE METRICS COMPLETED. COMPILE MATCH RECORDS AND CONCLUDE GAME TO CLOUD MATRIX.
                  </p>
                </div>
                <button
                  onClick={handleFinishGame}
                  className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black font-black text-xs py-3 px-6 uppercase tracking-wider transition-colors border-b-4 border-amber-700 active:border-b-0 active:translate-y-0.5 rounded-none cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  [ CONCLUDE MATCH RECORD ]
                </button>
              </div>
            )}

            {/* Leaderboard Klasemen */}
            <div className="border border-zinc-800 bg-[#0C0C0F] p-6 space-y-4 rounded-none">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#FFFFFF] flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" /> [ STANDINGS LOG READOUT ]
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-500 uppercase font-black text-[10px] tracking-wider">
                      <th className="py-2.5 px-1">POS</th>
                      <th className="py-2.5 px-1">NAME</th>
                      <th className="py-2.5 px-1 text-right">TOTAL_PTS</th>
                      <th className="py-2.5 px-1 text-center">VICTORIES_LOG</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((item, index) => {
                      const rank1 = item.rankCounts[1] || 0;
                      const rank2 = item.rankCounts[2] || 0;
                      return (
                        <tr key={item.id} className="border-b border-zinc-900 hover:bg-zinc-900/40 transition-colors font-medium">
                          <td className="py-3 px-1">
                            <span className={`flex items-center justify-center w-5 h-5 border font-black text-[9px]
                              ${index === 0 ? 'bg-amber-500/20 text-amber-500 border-amber-500/40' : 
                                index === 1 ? 'bg-zinc-700/20 text-zinc-400 border-zinc-700/40' : 
                                index === 2 ? 'bg-amber-800/20 text-amber-600 border-amber-800/40' : 
                                'text-zinc-600 border-zinc-800'}
                            `}>
                              {String(index + 1).padStart(2, '0')}
                            </span>
                          </td>
                          <td className="py-3 px-1 truncate max-w-[120px] font-black uppercase text-zinc-300">{item.name}</td>
                          <td className="py-3 px-1 text-right font-black text-red-500 tracking-wide">{item.totalScore} PTS</td>
                          <td className="py-3 px-1 text-center text-[9px] uppercase">
                            {rank1 > 0 && <span className="inline-block mx-0.5 px-1.5 py-0.5 rounded-none bg-amber-500/10 text-amber-500 font-extrabold border border-amber-500/20">🥇 {rank1}X</span>}
                            {rank2 > 0 && <span className="inline-block mx-0.5 px-1.5 py-0.5 rounded-none bg-zinc-400/10 text-zinc-400 font-extrabold border border-zinc-400/20">🥈 {rank2}X</span>}
                            {Object.entries(item.rankCounts).filter(([r]) => r !== '1' && r !== '2').map(([r, count]) => (
                              <span key={r} className="inline-block mx-0.5 px-1.5 py-0.5 rounded-none bg-[#121216] border border-zinc-800 text-zinc-500 font-bold">R{r}: {count}X</span>
                            ))}
                            {Object.values(item.rankCounts).length === 0 && <span className="text-[9px] text-zinc-600 italic">[ EMPTY_LOG ]</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* RIGHT: Scoring Trend Chart and Actions */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Chart Card */}
            <div className="border border-zinc-800 bg-[#0C0C0F] p-6 space-y-4 rounded-none">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-[#FFFFFF] flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-red-500" /> [ SCORING TREND MATRIX ]
                </h3>
                <p className="text-[9px] text-zinc-500 mt-1 uppercase">REALTIME POINT ACCUMULATION LOGS.</p>
              </div>

              {activeGame.rounds.length > 0 ? (
                <div className="w-full h-[220px]">
                  {chartReady ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="2 2" stroke="#27272a" opacity={0.3} />
                        <XAxis dataKey="name" stroke="#52525b" fontSize={9} tickLine={false} style={{ fontFamily: 'monospace' }} />
                        <YAxis stroke="#52525b" fontSize={9} tickLine={false} style={{ fontFamily: 'monospace' }} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#0C0C0F', 
                            border: '1px solid #EF4444',
                            borderRadius: '0px',
                            fontSize: '9px',
                            color: '#E2E8F0',
                            fontFamily: 'monospace'
                          }} 
                        />
                        <Legend iconSize={6} iconType="square" wrapperStyle={{ fontSize: '9px', paddingTop: '8px', fontFamily: 'monospace' }} />
                        {activeGame.players.map((p, idx) => (
                          <Line
                            key={p.id}
                            type="linear"
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
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-500 uppercase">
                      [ COMPILING GRAPHICS... ]
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-[180px] border border-dashed border-zinc-800 rounded-none flex items-center justify-center text-center text-[9px] text-zinc-500 italic p-6 uppercase leading-relaxed">
                  [ GRAPHICAL TREND PLOTS WILL GENERATE UPON FIRST SAVED ROUND CONSTANT ]
                </div>
              )}
            </div>

            {/* Match Stats Card */}
            <div className="bg-[#0C0C0F] border border-zinc-800 p-5 rounded-none space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-wider text-zinc-500">[ MATCH TELEMETRY SUMMARY ]</h4>
              <div className="grid grid-cols-2 gap-4 text-[10px] text-zinc-400 font-mono uppercase">
                <div>
                  <span className="text-zinc-600 block">TOTAL PLAYERS</span>
                  <span className="text-xs font-black text-zinc-200">{activeGame.totalPlayers} PLAYERS</span>
                </div>
                <div>
                  <span className="text-zinc-600 block">ROUNDS COMPLETED</span>
                  <span className="text-xs font-black text-zinc-200">{activeGame.rounds.length} ROUNDS</span>
                </div>
                <div>
                  <span className="text-zinc-600 block">SEQUENCE PROTOCOL</span>
                  <span className="text-xs font-black text-zinc-200">{activeGame.isUnlimitedRounds ? 'FREEPLAY' : `${activeGame.totalRounds} ROUNDS LIMIT`}</span>
                </div>
                <div>
                  <span className="text-zinc-600 block">MAX ROUND REWARD</span>
                  <span className="text-xs font-black text-red-500">+{calculatePoints(1)} PTS</span>
                </div>
              </div>
            </div>

            {/* Cancel / Reset Game Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleCancelGame}
                className="flex-1 py-2.5 bg-[#121216] border border-zinc-800 hover:border-red-500 text-[10px] font-black text-zinc-500 hover:text-red-500 uppercase tracking-wider transition-colors rounded-none flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5 shrink-0" />
                [ ABORT MATCH ]
              </button>

              {activeGame.rounds.length > 0 && (
                <button
                  onClick={() => {
                    showModal(
                      "RESET DATA BABAK",
                      "APAKAH ANDA YAKIN INGIN MENGHAPUS SELURUH SKOR BABAK YANG TERINPUT PADA GAME INI?",
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
                  className="flex-1 py-2.5 bg-[#121216] border border-zinc-800 hover:border-zinc-700 text-[10px] font-black text-zinc-500 hover:text-zinc-300 uppercase tracking-wider transition-colors rounded-none flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                  [ CLEAR ROUNDS ]
                </button>
              )}

              {activeGame.isUnlimitedRounds && activeGame.rounds.length > 0 && (
                <button
                  onClick={handleFinishGame}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-black text-[10px] uppercase tracking-wider transition-colors border-b-4 border-amber-700 active:border-b-0 active:translate-y-0.5 rounded-none flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  [ CONCLUDE ]
                </button>
              )}
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
