"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

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
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'player' | 'report' | 'setting'>('dashboard');
  const [user, setUser] = useState<any>(null);

  // Latency, Connection & System metrics state
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
  const [, setSelectedGameRounds] = useState<any[]>([]);
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

  useEffect(() => {
    setMounted(true);

    const checkAuthAndLoad = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/admin');
        return;
      }
      
      setUser(session.user);
      
      const startPing = performance.now();
      try {
        const { data: pingResult, error: pingError } = await supabase.rpc('ping');
        const endPing = performance.now();
        if (pingError) throw pingError;
        if (pingResult === 'success') {
          setLatency(Math.round(endPing - startPing));
          setApiConnected(true);
        } else {
          setApiConnected(false);
        }
      } catch (err) {
        console.error('Failed to ping Supabase API:', err);
        setApiConnected(false);
      }

      try {
        const { data: metricsData, error: metricsError } = await supabase.rpc('get_system_metrics');
        if (metricsError) throw metricsError;
        
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
        console.error('Failed to fetch system metrics:', err);
        setRlsActive(false);
        setSettingsActive(false);
      }
      
      await fetchPlayers();
      await fetchSettings();
      await fetchGames();
      setLoading(false);
    };

    checkAuthAndLoad();
  }, [router]);

  const fetchPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setPlayers(data);
    } catch (err) {
      console.error('Error fetching players:', err);
    }
  };

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*');

      if (error) throw error;
      
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
      console.error('Error fetching settings:', err);
    }
  };

  const fetchGames = async () => {
    try {
      const { data: files, error: listError } = await supabase.storage
        .from('game-reports')
        .list('', { limit: 100 });

      if (listError) throw listError;

      if (files) {
        const jsonFiles = files.filter(f => f.name.endsWith('.json'));
        
        const fetchedGames = await Promise.all(
          jsonFiles.map(async (file) => {
            try {
              const { data, error } = await supabase.storage
                .from('game-reports')
                .download(file.name);
              
              if (error) return null;
              if (data) {
                const text = await data.text();
                const parsed = JSON.parse(text);
                return {
                  id: parsed.id,
                  total_players: parsed.totalPlayers,
                  total_rounds: parsed.totalRounds,
                  is_unlimited_rounds: parsed.isUnlimitedRounds,
                  created_at: parsed.createdAt || file.created_at || file.updated_at
                };
              }
            } catch (err) {
              console.error(`Error loading game json for ${file.name}:`, err);
            }
            return null;
          })
        );

        const validGames = fetchedGames
          .filter((g): g is any => g !== null)
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        setGames(validGames);
      }
    } catch (err) {
      console.error('Error fetching games from storage:', err);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin');
  };

  const openGameSummaryModal = async (g: Game) => {
    setLoadingSummary(true);
    setSelectedGame(g);
    try {
      let parsedJson: any = null;
      try {
        const { data, error } = await supabase.storage
          .from('game-reports')
          .download(`${g.id}.json`);

        if (error) {
          if (error.message?.includes('Object not found') || (error as any).status === 404 || (error as any).status === 400) {
            console.log(`Report JSON not found in storage for game ${g.id}, querying database tables instead.`);
          } else {
            console.warn('Storage API error during game report download:', error);
          }
        } else if (data) {
          const text = await data.text();
          parsedJson = JSON.parse(text);
        }
      } catch (storageErr) {
        console.warn('Unexpected error loading game report from storage:', storageErr);
      }

      if (parsedJson) {
        const playerMap: { [id: string]: { name: string, totalScore: number, rankCounts: { [rank: number]: number } } } = {};
        
        parsedJson.players.forEach((p: any) => {
          playerMap[p.id] = { name: p.name, totalScore: 0, rankCounts: {} };
        });

        parsedJson.rounds.forEach((round: any) => {
          Object.entries(round.scores).forEach(([pid, scoreObj]: [string, any]) => {
            if (playerMap[pid]) {
              playerMap[pid].totalScore += scoreObj.score;
              playerMap[pid].rankCounts[scoreObj.rank] = (playerMap[pid].rankCounts[scoreObj.rank] || 0) + 1;
            }
          });
        });

        const N = parsedJson.totalPlayers;
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
        setSelectedGameRounds(parsedJson.rounds);
        setSelectedGameReportData(parsedJson);
      } else {
        const { data: scoresData, error: scoresError } = await supabase
          .from('game_scores')
          .select(`
            player_id,
            calculated_score,
            rank,
            round_number,
            players (
              name
            )
          `)
          .eq('game_id', g.id);

        if (scoresError) throw scoresError;

        if (scoresData) {
          const playerMap: { [id: string]: { name: string, totalScore: number, rankCounts: { [rank: number]: number } } } = {};
          
          scoresData.forEach((item: any) => {
            const pid = item.player_id;
            const name = item.players?.name || 'Pemain Terhapus';
            if (!playerMap[pid]) {
              playerMap[pid] = { name, totalScore: 0, rankCounts: {} };
            }
            playerMap[pid].totalScore += item.calculated_score;
            playerMap[pid].rankCounts[item.rank] = (playerMap[pid].rankCounts[item.rank] || 0) + 1;
          });

          const N = g.total_players;
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

          const roundsMap: { [roundNumber: number]: { roundNumber: number, scores: { [pid: string]: { score: number, rank: number } } } } = {};
          scoresData.forEach((item: any) => {
            const rNum = item.round_number;
            if (!roundsMap[rNum]) {
              roundsMap[rNum] = { roundNumber: rNum, scores: {} };
            }
            roundsMap[rNum].scores[item.player_id] = {
              score: item.calculated_score,
              rank: item.rank
            };
          });

          const roundsList = Object.values(roundsMap).sort((a, b) => a.roundNumber - b.roundNumber);
          setSelectedGameRounds(roundsList);

          const playersList = Object.entries(playerMap).map(([id, val]) => ({
            id,
            name: val.name
          }));
          const reportData = {
            id: g.id,
            totalPlayers: g.total_players,
            totalRounds: g.total_rounds,
            isUnlimitedRounds: g.is_unlimited_rounds,
            createdAt: g.created_at,
            players: playersList,
            rounds: roundsList.map((r: any) => ({
              roundNumber: r.roundNumber,
              scores: Object.entries(r.scores).reduce((acc: any, [pid, sObj]: [string, any]) => {
                acc[pid] = { score: sObj.score, rank: sObj.rank };
                return acc;
              }, {})
            }))
          };
          setSelectedGameReportData(reportData);
        }
      }
    } catch (err) {
      console.error('Error fetching game summary detail:', err);
      showModal("Gagal Memuat", "Gagal memuat ringkasan game.", () => {}, 'alert', 'error');
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleToggleMaintenance = async (checked: boolean) => {
    setSavingSettings('maintenance');
    try {
      const { error } = await supabase
        .from('settings')
        .update({ value: checked ? 'true' : 'false' })
        .eq('key', 'maintenance_mode');

      if (error) throw error;
      setMaintenanceMode(checked);
    } catch (err) {
      console.error(err);
      showModal("Gagal Memperbarui", "Gagal memperbarui status Maintenance.", () => {}, 'alert', 'error');
    } finally {
      setSavingSettings(null);
    }
  };

  const handleToggleUnlimitedRounds = async (checked: boolean) => {
    setSavingSettings('rounds');
    try {
      const { error } = await supabase
        .from('settings')
        .update({ value: checked ? 'true' : 'false' })
        .eq('key', 'unlimited_rounds');

      if (error) throw error;
      setUnlimitedRounds(checked);
    } catch (err) {
      console.error(err);
      showModal("Gagal Memperbarui", "Gagal memperbarui status Unlimited Rounds.", () => {}, 'alert', 'error');
    } finally {
      setSavingSettings(null);
    }
  };

  const handleMaxPlayersChange = async (value: number) => {
    if (value < 2 || value > 20) return;
    setSavingSettings('max_players');
    try {
      const { error } = await supabase
        .from('settings')
        .update({ value: String(value) })
        .eq('key', 'max_players');

      if (error) throw error;
      setMaxPlayers(value);
    } catch (err) {
      console.error(err);
      showModal("Gagal Memperbarui", "Gagal memperbarui batas maksimal pemain.", () => {}, 'alert', 'error');
    } finally {
      setSavingSettings(null);
    }
  };

  const handleSavePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerModal.name.trim()) return;

    const capitalizedName = playerModal.name.trim().replace(/\b\w/g, l => l.toUpperCase());

    try {
      if (playerModal.mode === 'create') {
        const { error } = await supabase
          .from('players')
          .insert({ name: capitalizedName });

        if (error) {
          if (error.code === '23505') {
            showModal("Nama Terdaftar", "Nama pemain ini sudah terdaftar!", () => {}, 'alert', 'warning');
          } else {
            throw error;
          }
          return;
        }
      } else {
        const { error } = await supabase
          .from('players')
          .update({ name: capitalizedName })
          .eq('id', playerModal.id);

        if (error) {
          if (error.code === '23505') {
            showModal("Nama Terdaftar", "Nama pemain ini sudah terdaftar!", () => {}, 'alert', 'warning');
          } else {
            throw error;
          }
          return;
        }
      }

      await fetchPlayers();
      setPlayerModal({ show: false, mode: 'create', name: '' });
    } catch (err) {
      console.error(err);
      showModal("Gagal Menyimpan", "Gagal menyimpan nama pemain.", () => {}, 'alert', 'error');
    }
  };

  const handleDeletePlayer = async (id: string, name: string) => {
    showModal(
      "Hapus Pemain",
      `Hapus pemain "${name}"? Tindakan ini juga akan menghapus log skor permainan pemain tersebut.`,
      async () => {
        try {
          const { error } = await supabase
            .from('players')
            .delete()
            .eq('id', id);

          if (error) throw error;
          await fetchPlayers();
        } catch (err) {
          console.error(err);
          showModal("Gagal Menghapus", "Gagal menghapus pemain.", () => {}, 'alert', 'error');
        }
      },
      'confirm',
      'error'
    );
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
    handleDeletePlayer
  };
}
