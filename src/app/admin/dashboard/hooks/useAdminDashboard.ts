"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  pingAdmin,
  getAdminSystemMetrics,
  fetchAdminPlayers,
  fetchAdminSettings,
  fetchAdminGames,
  fetchAdminGameSummary,
  updateAdminSetting,
  saveAdminPlayer,
  deleteAdminPlayer,
  deleteAdminGames
} from '@/app/actions/admin';

export interface Player {
  id: string;
  name: string;
  created_at: string;
}

export interface Game {
  id: string;
  total_players: number;
  total_rounds: number;
  is_unlimited_rounds: boolean;
  created_at: string;
}

export default function useAdminDashboard() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'player' | 'report' | 'setting' | 'play'>('dashboard');
  const [user, setUser] = useState<any>(null);

  
  const [latency, setLatency] = useState<number | null>(null);
  const [apiConnected, setApiConnected] = useState<boolean | 'checking'>('checking');
  const [dbEngine, setDbEngine] = useState<string>("PostgreSQL (Supabase Cloud)");
  const [rlsActive, setRlsActive] = useState<boolean | 'checking'>('checking');
  const [settingsActive, setSettingsActive] = useState<boolean | 'checking'>('checking');
  const [serverLocation, setServerLocation] = useState<string>("Singapore (ap-southeast-1)");

  const [players, setPlayers] = useState<Player[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [playerModal, setPlayerModal] = useState<{ show: boolean; mode: 'create' | 'edit'; id?: string; name: string }>({
    show: false,
    mode: 'create',
    name: ''
  });

  const [games, setGames] = useState<Game[]>([]);

  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [selectedGameLeaderboard, setSelectedGameLeaderboard] = useState<any[]>([]);

  const [loadingSummary, setLoadingSummary] = useState(false);
  const [selectedGameReportData, setSelectedGameReportData] = useState<any | null>(null);

  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(false);
  const [unlimitedRounds, setUnlimitedRounds] = useState<boolean>(false);
  const [maxPlayers, setMaxPlayers] = useState<number>(8);
  const [savingSettings, setSavingSettings] = useState<string | null>(null);

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

  const getSessionToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || '';
  };

  useEffect(() => {
    Promise.resolve().then(() => setMounted(true));

    const checkAuthAndLoad = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/admin');
        return;
      }
      
      setUser(session.user);
      const token = session.access_token;
      
      const startPing = performance.now();
      try {
        const pingResult = await pingAdmin(token);
        const endPing = performance.now();
        if (pingResult === 'success') {
          setLatency(Math.round(endPing - startPing));
          setApiConnected(true);
        } else {
          setApiConnected(false);
        }
      } catch (err) {
        
        setApiConnected(false);
      }

      try {
        const metricsData = await getAdminSystemMetrics(token);
        
        if (metricsData) {
          const isLocal = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('localhost') || 
                          process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('127.0.0.1');
          const envTag = isLocal ? "Local Docker" : "Supabase Cloud";

          const verString = metricsData.db_version || '';
          const matchVer = verString.match(/PostgreSQL \d+(\.\d+)*/i);
          if (matchVer) {
            setDbEngine(matchVer[0] + ` (${envTag})`);
          } else {
            setDbEngine(`PostgreSQL (${envTag})`);
          }

          setRlsActive(metricsData.rls_enabled);
          setSettingsActive(metricsData.settings_active);
          
          const tz = metricsData.timezone || '';
          if (isLocal) {
            setServerLocation(`Lokal (${tz || 'UTC'})`);
          } else {
            setServerLocation(`Singapore (${tz || 'ap-southeast-1'})`);
          }
        }
      } catch (err) {
        
        setRlsActive(false);
        setSettingsActive(false);
      }
      
      await fetchPlayers(token);
      await fetchSettings(token);
      await fetchGames(token);
      setLoading(false);
    };

    checkAuthAndLoad();
  }, [router]);

  async function fetchPlayers(token: string) {
    try {
      const data = await fetchAdminPlayers(token);
      setPlayers(data);
    } catch (err) {
      
    }
  }

  async function fetchSettings(token: string) {
    try {
      const data = await fetchAdminSettings(token);
      if (data) {
        const mMode = data.find(s => s.key === 'maintenance_mode')?.value === 'true';
        const uRounds = data.find(s => s.key === 'unlimited_rounds')?.value === 'true';
        const mPlayersVal = data.find(s => s.key === 'max_players')?.value;
        setMaintenanceMode(mMode);
        setUnlimitedRounds(uRounds);
        if (mPlayersVal) {
          setMaxPlayers(parseInt(mPlayersVal, 10) || 8);
        }
      }
    } catch (err) {
      
    }
  }

  async function fetchGames(token: string) {
    try {
      const validGames = await fetchAdminGames(token);
      setGames(validGames);
    } catch (err) {
      
    }
  }

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    router.push('/admin');
  }, [router]);

  // Auto logout on 30 minutes of inactivity
  useEffect(() => {
    if (!user) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(async () => {
        await handleLogout();
      }, 30 * 60 * 1000);
    };

    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];

    resetTimer();

    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [user, handleLogout]);

  const openGameSummaryModal = async (g: Game) => {
    setLoadingSummary(true);
    setSelectedGame(g);
    try {
      const token = await getSessionToken();
      const parsedGame = await fetchAdminGameSummary(token, g.id);

      if (parsedGame) {
        const playerMap: { [id: string]: { name: string, totalScore: number, rankCounts: { [rank: number]: number } } } = {};
        
        parsedGame.players.forEach((p: any) => {
          playerMap[p.id] = { name: p.name, totalScore: 0, rankCounts: {} };
        });

        parsedGame.rounds.forEach((round: any) => {
          Object.entries(round.scores).forEach(([pid, scoreObj]: [string, any]) => {
            if (playerMap[pid]) {
              playerMap[pid].totalScore += scoreObj.score;
              playerMap[pid].rankCounts[scoreObj.rank] = (playerMap[pid].rankCounts[scoreObj.rank] || 0) + 1;
            }
          });
        });

        const N = parsedGame.totalPlayers;
        const leaderboard = Object.entries(playerMap).map(([id, val]) => ({
          id,
          ...val
        })).sort((a, b) => {
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

        setSelectedGameLeaderboard(leaderboard);
        setSelectedGameReportData(parsedGame);
      } else {
        throw new Error('File laporan (.msgpack) tidak ditemukan di cloud storage.');
      }
    } catch (err: any) {
      
      showModal("Gagal Memuat", err?.message || "Gagal memuat ringkasan game.", () => {}, 'alert', 'error');
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleToggleMaintenance = async (checked: boolean) => {
    setSavingSettings('maintenance');
    try {
      const token = await getSessionToken();
      await updateAdminSetting(token, 'maintenance_mode', checked ? 'true' : 'false');
      setMaintenanceMode(checked);
    } catch (err) {
      
      showModal("Gagal Memperbarui", "Gagal memperbarui status Maintenance.", () => {}, 'alert', 'error');
    } finally {
      setSavingSettings(null);
    }
  };

  const handleToggleUnlimitedRounds = async (checked: boolean) => {
    setSavingSettings('rounds');
    try {
      const token = await getSessionToken();
      await updateAdminSetting(token, 'unlimited_rounds', checked ? 'true' : 'false');
      setUnlimitedRounds(checked);
    } catch (err) {
      
      showModal("Gagal Memperbarui", "Gagal memperbarui status Unlimited Rounds.", () => {}, 'alert', 'error');
    } finally {
      setSavingSettings(null);
    }
  };

  const handleMaxPlayersChange = async (value: number) => {
    if (value < 2 || value > 20) return;
    setSavingSettings('max_players');
    try {
      const token = await getSessionToken();
      await updateAdminSetting(token, 'max_players', String(value));
      setMaxPlayers(value);
    } catch (err) {
      
      showModal("Gagal Memperbarui", "Gagal memperbarui batas maksimal pemain.", () => {}, 'alert', 'error');
    } finally {
      setSavingSettings(null);
    }
  };

  const handleSavePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerModal.name.trim()) return;

    try {
      const token = await getSessionToken();
      await saveAdminPlayer(token, playerModal.name, playerModal.id);
      await fetchPlayers(token);
      setPlayerModal({ show: false, mode: 'create', name: '' });
    } catch (err: any) {
      
      if (err.message?.includes('23505') || err.message?.includes('duplicate') || err.message?.includes('already exists')) {
        showModal("Nama Terdaftar", "Nama pemain ini sudah terdaftar!", () => {}, 'alert', 'warning');
      } else {
        showModal("Gagal Menyimpan", "Gagal menyimpan nama pemain.", () => {}, 'alert', 'error');
      }
    }
  };

  const handleDeletePlayer = async (id: string, name: string) => {
    showModal(
      "Hapus Pemain",
      `Hapus pemain "${name}"? Tindakan ini juga akan menghapus log skor permainan pemain tersebut.`,
      async () => {
        try {
          const token = await getSessionToken();
          await deleteAdminPlayer(token, id);
          await fetchPlayers(token);
        } catch (err) {
          
          showModal("Gagal Menghapus", "Gagal menghapus pemain.", () => {}, 'alert', 'error');
        }
      },
      'confirm',
      'error'
    );
  };

  const handleDeleteGames = async (gameIds: string[]) => {
    try {
      const token = await getSessionToken();
      await deleteAdminGames(token, gameIds);
      setGames(prev => prev.filter(g => !gameIds.includes(g.id)));
      
      const { localDb } = await import('@/lib/db');
      for (const id of gameIds) {
        await localDb.gamesCache.delete(id);
      }
    } catch {
      showModal("Gagal Menghapus", "Gagal menghapus laporan game.", () => {}, 'alert', 'error');
      throw new Error("Failed to delete games");
    }
  };

  return {
    mounted,
    loading,
    activeTab,
    setActiveTab,
    user,
    latency,
    apiConnected,
    dbEngine,
    rlsActive,
    settingsActive,
    serverLocation,
    players,
    searchQuery,
    setSearchQuery,
    playerModal,
    setPlayerModal,
    games,
    selectedGame,
    setSelectedGame,
    selectedGameLeaderboard,
    setSelectedGameLeaderboard,
    loadingSummary,
    selectedGameReportData,
    setSelectedGameReportData,
    maintenanceMode,
    unlimitedRounds,
    maxPlayers,
    savingSettings,
    modalConfig,
    setModalConfig,
    handleLogout,
    openGameSummaryModal,
    handleToggleMaintenance,
    handleToggleUnlimitedRounds,
    handleMaxPlayersChange,
    handleSavePlayer,
    handleDeletePlayer,
    handleDeleteGames,
    showModal
  };
}
