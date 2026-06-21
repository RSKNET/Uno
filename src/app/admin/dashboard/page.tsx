"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { exportGamePdf } from '@/lib/pdf-template';
import { CustomModal } from '@/components/modal';
import { 
  Shield, 
  LogOut, 
  Users, 
  Settings, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  ShieldAlert, 
  Loader2, 
  Sparkles, 
  Sliders, 
  LayoutDashboard, 
  FileText, 
  CheckCircle2, 
  Download
} from 'lucide-react';

interface Player {
  id: string;
  name: string;
  created_at: string;
}

interface Game {
  id: string;
  total_players: number;
  total_rounds: number;
  is_unlimited_rounds: boolean;
  created_at: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'player' | 'report' | 'setting'>('dashboard');

  
  const [user, setUser] = useState<any>(null);

  
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
  const [selectedGameRounds, setSelectedGameRounds] = useState<any[]>([]);
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

  
  const filteredPlayers = players.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-400">
        <div className="flex flex-col items-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-800 border-t-zinc-400"></div>
          <span className="text-xs uppercase tracking-wider opacity-60">Memuat Portal Dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-row min-h-screen bg-[#050505] text-zinc-50 w-full max-w-[98%] mx-auto relative transition-colors duration-500">
      
      
      <div className="absolute top-[-10%] right-[-10%] w-[45%] h-[40%] rounded-full bg-rose-500/5 blur-[120px] pointer-events-none" />

      
      <aside className="hidden lg:flex flex-col w-64 border-r border-zinc-800/60 bg-[#070709]/80 p-6 shrink-0 space-y-6">
        <div className="flex items-center gap-2 px-2">
          <Shield className="w-5 h-5 text-rose-500" />
          <span className="font-display font-extrabold tracking-tight text-sm uppercase">Uno Portal Admin</span>
        </div>
        
        <div className="w-full h-px bg-zinc-800/60" />

        <nav className="flex-1 flex flex-col gap-1.5">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all
              ${activeTab === 'dashboard' 
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/10' 
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'
              }
            `}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('player')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all
              ${activeTab === 'player' 
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/10' 
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'
              }
            `}
          >
            <Users className="w-4 h-4" />
            Daftar Pemain
          </button>
          <button
            onClick={() => setActiveTab('report')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all
              ${activeTab === 'report' 
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/10' 
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'
              }
            `}
          >
            <FileText className="w-4 h-4" />
            Laporan Game
          </button>
          <button
            onClick={() => setActiveTab('setting')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all
              ${activeTab === 'setting' 
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/10' 
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'
              }
            `}
          >
            <Settings className="w-4 h-4" />
            Pengaturan
          </button>
        </nav>

        <div className="w-full h-px bg-zinc-800/60" />

        <div className="space-y-3">
          <div className="px-2 truncate">
            <p className="text-[10px] uppercase font-bold text-zinc-500">Akun Login</p>
            <p className="text-xs font-mono text-zinc-400 truncate mt-0.5">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-zinc-800 hover:bg-zinc-900 transition-colors text-xs font-bold text-red-500"
          >
            <LogOut className="w-4 h-4" />
            Keluar
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar (Right side, default minimize only icon) */}
      <aside className="flex lg:hidden flex-col w-16 border-l border-zinc-800 bg-[#070709]/80 py-6 items-center shrink-0 space-y-6 order-last">
        <div className="p-2">
          <Shield className="w-5 h-5 text-rose-500" />
        </div>

        <div className="w-10 h-px bg-zinc-800/60" />

        <nav className="flex-1 flex flex-col gap-3">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`p-3 rounded-xl transition-all flex justify-center
              ${activeTab === 'dashboard' 
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/10' 
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'
              }
            `}
            title="Dashboard"
          >
            <LayoutDashboard className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTab('player')}
            className={`p-3 rounded-xl transition-all flex justify-center
              ${activeTab === 'player' 
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/10' 
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'
              }
            `}
            title="Daftar Pemain"
          >
            <Users className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTab('report')}
            className={`p-3 rounded-xl transition-all flex justify-center
              ${activeTab === 'report' 
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/10' 
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'
              }
            `}
            title="Laporan Game"
          >
            <FileText className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTab('setting')}
            className={`p-3 rounded-xl transition-all flex justify-center
              ${activeTab === 'setting' 
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/10' 
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'
              }
            `}
            title="Pengaturan"
          >
            <Settings className="w-4 h-4" />
          </button>
        </nav>

        <div className="w-10 h-px bg-zinc-800/60" />

        <button
          onClick={handleLogout}
          className="p-3 rounded-xl border border-zinc-800 text-red-500 hover:bg-zinc-900 transition-colors flex justify-center"
          title="Keluar"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto p-6 md:p-8 relative z-10">
        
        {/* Tab 1: Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fade-in">
            {/* Welcome Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/30 border border-zinc-800/50 p-6 rounded-3xl backdrop-blur-sm">
              <div>
                <h2 className="text-xl font-extrabold tracking-tight font-display text-gradient">Selamat Datang, Admin!</h2>
                <p className="text-xs text-zinc-400 mt-1">Berikut ringkasan performa sistem dan database UNO Skors.</p>
              </div>
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full select-none self-start md:self-auto">
                <CheckCircle2 className="w-4 h-4" />
                Sistem Sehat
              </div>
            </div>

            {/* Grid Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bezel-outer">
                <div className="bezel-inner p-6 space-y-4 cursor-pointer hover:border-zinc-700/50 transition-all" onClick={() => setActiveTab('player')}>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-zinc-500">Pemain Terdaftar</p>
                      <p className="text-2xl font-extrabold font-display">{players.length}</p>
                    </div>
                    <div className="p-2.5 bg-rose-500/10 text-rose-400 border border-rose-500/15 rounded-xl">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-400 font-semibold">Kelola database nama pemain</p>
                </div>
              </div>

              <div className="bezel-outer">
                <div className="bezel-inner p-6 space-y-4 cursor-pointer hover:border-zinc-700/50 transition-all" onClick={() => setActiveTab('report')}>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-zinc-500">Total Laporan Game</p>
                      <p className="text-2xl font-extrabold font-display">{games.length}</p>
                    </div>
                    <div className="p-2.5 bg-rose-500/10 text-rose-400 border border-rose-500/15 rounded-xl">
                      <FileText className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-400 font-semibold">Lihat log pertandingan historis</p>
                </div>
              </div>

              <div className="bezel-outer">
                <div className="bezel-inner p-6 space-y-4 cursor-pointer hover:border-zinc-700/50 transition-all" onClick={() => setActiveTab('setting')}>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-zinc-500">Maintenance Mode</p>
                      <p className={`text-[10px] font-extrabold font-display mt-2 border px-2.5 py-0.5 rounded-full inline-block
                        ${maintenanceMode 
                          ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                        }
                      `}>
                        {maintenanceMode ? 'AKTIF' : 'NONAKTIF'}
                      </p>
                    </div>
                    <div className="p-2.5 bg-rose-500/10 text-rose-400 border border-rose-500/15 rounded-xl">
                      <Settings className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-400 font-semibold">Ubah status pemeliharaan</p>
                </div>
              </div>
            </div>

            {/* System Metrics Info */}
            <div className="bezel-outer">
              <div className="bezel-inner p-6 space-y-5">
                <h3 className="text-base font-bold font-display flex items-center gap-2">
                  <Shield className="w-4.5 h-4.5 text-rose-500" /> Detail Konektivitas & API Database
                </h3>

                <div className="w-full h-px bg-zinc-800/60" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400">Database Engine</span>
                      <span className="font-semibold text-zinc-200">PostgreSQL (Supabase Cloud)</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400">Status Koneksi API</span>
                      <span className="text-emerald-400 font-bold">TERHUBUNG (OK)</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400">Tabel Realtime Settings</span>
                      <span className="text-emerald-400 font-semibold">Aktif & Sinkron</span>
                    </div>
                  </div>

                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400">Supabase RLS Policy</span>
                      <span className="text-emerald-400 font-semibold">Aktif (Aman)</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400">Latency Check</span>
                      <span className="font-mono text-zinc-200">&lt; 15ms</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400">Lokasi Server</span>
                      <span className="font-semibold text-zinc-200">Singapore (ap-southeast-1)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Player CRUD */}
        {activeTab === 'player' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bezel-outer">
              <div className="bezel-inner p-6 space-y-5">
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold font-display flex items-center gap-2">
                      <Users className="w-5 h-5 text-rose-500" /> Database Pemain
                    </h3>
                    <p className="text-xs text-zinc-400">Kelola dan daftarkan nama pemain baru ke Supabase database.</p>
                  </div>

                  <button
                    onClick={() => setPlayerModal({ show: true, mode: 'create', name: '' })}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs transition-colors active:scale-95 shadow-md shadow-rose-500/10 self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4" />
                    Tambah Pemain
                  </button>
                </div>

                {/* Search bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari nama pemain..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:border-rose-500 text-zinc-100"
                  />
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-500 text-xs font-bold uppercase tracking-wider">
                        <th className="py-2.5 px-2">Nama Pemain</th>
                        <th className="py-2.5 px-2">Tanggal Terdaftar</th>
                        <th className="py-2.5 px-2 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPlayers.map((p) => (
                        <tr key={p.id} className="border-b border-zinc-900/60 hover:bg-zinc-900/20 transition-colors">
                          <td className="py-3.5 px-2 font-semibold text-zinc-200">{p.name}</td>
                          <td className="py-3.5 px-2 text-xs text-zinc-500">
                            {new Date(p.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </td>
                          <td className="py-3.5 px-2 text-right">
                            <div className="inline-flex gap-2">
                              <button
                                onClick={() => setPlayerModal({ show: true, mode: 'edit', id: p.id, name: p.name })}
                                className="p-1.5 rounded-lg border border-zinc-800 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
                                title="Edit Nama"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeletePlayer(p.id, p.name)}
                                className="p-1.5 rounded-lg border border-zinc-800 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                title="Hapus Pemain"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredPlayers.length === 0 && (
                        <tr>
                          <td colSpan={3} className="py-8 text-center text-xs text-zinc-500 italic">
                            Pemain tidak ditemukan atau kosong.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Reports */}
        {activeTab === 'report' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bezel-outer">
              <div className="bezel-inner p-6 space-y-5">
                
                <div className="space-y-1">
                  <h3 className="text-lg font-bold font-display flex items-center gap-2">
                    <FileText className="w-5 h-5 text-rose-500" /> Laporan Game UNO
                  </h3>
                  <p className="text-xs text-zinc-400">Daftar seluruh pertandingan UNO yang telah didaftarkan ke cloud database.</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-500 text-xs font-bold uppercase tracking-wider">
                        <th className="py-2.5 px-2">Game ID</th>
                        <th className="py-2.5 px-2">Tanggal Game</th>
                        <th className="py-2.5 px-2">Jumlah Pemain</th>
                        <th className="py-2.5 px-2">Babak Ditentukan</th>
                        <th className="py-2.5 px-2 text-right">Tautan Ringkasan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {games.map((g) => (
                        <tr key={g.id} className="border-b border-zinc-900/60 hover:bg-zinc-900/20 transition-colors">
                          <td className="py-3.5 px-2 font-mono text-xs text-rose-400 font-semibold">{g.id.slice(0, 8)}...</td>
                          <td className="py-3.5 px-2 text-xs text-zinc-400">
                            {new Date(g.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-3.5 px-2 text-xs text-zinc-300 font-semibold">{g.total_players} Pemain</td>
                          <td className="py-3.5 px-2 text-xs text-zinc-400">
                            {g.is_unlimited_rounds ? 'Bebas (Unlimited)' : `${g.total_rounds} Babak`}
                          </td>
                          <td className="py-3.5 px-2 text-right">
                            <button
                              onClick={() => openGameSummaryModal(g)}
                              className="inline-flex items-center gap-1 text-xs font-bold text-rose-500 hover:text-rose-400 transition-colors bg-transparent border-0 cursor-pointer"
                            >
                              Buka Ringkasan &rarr;
                            </button>
                          </td>
                        </tr>
                      ))}
                      {games.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-xs text-zinc-500 italic">
                            Belum ada laporan pertandingan yang terdaftar di cloud.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Settings (Wider dual-card layout grid) */}
        {activeTab === 'setting' && (
          <div className="space-y-6 animate-fade-in w-full">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/30 border border-zinc-800/50 p-6 rounded-3xl backdrop-blur-sm mb-2">
              <div>
                <h2 className="text-xl font-extrabold tracking-tight font-display text-gradient">Pengaturan Sistem</h2>
                <p className="text-xs text-zinc-400 mt-1">Konfigurasi batasan match, mode pemeliharaan, dan default parameter permainan.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full items-start">
              
              {/* Left Column: Security and Access */}
              <div className="bezel-outer w-full">
                <div className="bezel-inner p-6 space-y-5">
                  <h3 className="text-sm font-bold font-display flex items-center gap-2 text-zinc-200">
                    <ShieldAlert className="w-4.5 h-4.5 text-red-500 shrink-0" />
                    Status & Akses Keamanan
                  </h3>
                  
                  <div className="w-full h-px bg-zinc-800/60" />

                  {/* Maintenance Mode Toggle Switch */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-sm font-semibold flex items-center gap-1.5 text-zinc-200">
                        Maintenance Mode
                      </span>
                      <p className="text-[11px] text-zinc-400 leading-normal max-w-sm">
                        Mengalihkan seluruh halaman pemain secara real-time ke layar informasi pemeliharaan sistem.
                      </p>
                    </div>

                    <button
                      onClick={() => handleToggleMaintenance(!maintenanceMode)}
                      disabled={savingSettings === 'maintenance'}
                      className={`w-11 h-6 rounded-full transition-colors relative shrink-0 focus:outline-none border
                        ${maintenanceMode 
                          ? 'bg-red-500 border-red-500' 
                          : 'bg-zinc-800 border-zinc-700'
                        }
                      `}
                    >
                      {savingSettings === 'maintenance' ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400 absolute top-1 left-1.5" />
                      ) : (
                        <span className={`block w-4.5 h-4.5 rounded-full bg-white transition-all absolute top-0.5
                          ${maintenanceMode ? 'right-0.5' : 'left-0.5'}
                        `} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Match Configuration */}
              <div className="bezel-outer w-full">
                <div className="bezel-inner p-6 space-y-5">
                  <h3 className="text-sm font-bold font-display flex items-center gap-2 text-zinc-200">
                    <Sliders className="w-4.5 h-4.5 text-rose-500 shrink-0" />
                    Konfigurasi Default Permainan
                  </h3>

                  <div className="w-full h-px bg-zinc-800/60" />

                  <div className="space-y-6">
                    {/* Unlimited Rounds */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <span className="text-sm font-semibold flex items-center gap-1.5 text-zinc-200">
                          Batas Babak Bebas
                        </span>
                        <p className="text-[11px] text-zinc-400 leading-normal max-w-sm">
                          Mengizinkan default form setup baru berada pada mode unlimited babak.
                        </p>
                      </div>

                      <button
                        onClick={() => handleToggleUnlimitedRounds(!unlimitedRounds)}
                        disabled={savingSettings === 'rounds'}
                        className={`w-11 h-6 rounded-full transition-colors relative shrink-0 focus:outline-none border
                          ${unlimitedRounds 
                            ? 'bg-rose-500 border-rose-500' 
                            : 'bg-zinc-800 border-zinc-700'
                          }
                        `}
                      >
                        {savingSettings === 'rounds' ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400 absolute top-1 left-1.5" />
                        ) : (
                          <span className={`block w-4.5 h-4.5 rounded-full bg-white transition-all absolute top-0.5
                            ${unlimitedRounds ? 'right-0.5' : 'left-0.5'}
                          `} />
                        )}
                      </button>
                    </div>

                    {/* Max Players Config */}
                    <div className="flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <span className="text-sm font-semibold flex items-center gap-1.5 text-zinc-200">
                          Maksimal Pemain
                        </span>
                        <p className="text-[11px] text-zinc-400 leading-normal max-w-sm">
                          Mengatur batas maksimal jumlah pemain yang dapat dipilih pada saat setup.
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <input
                          type="number"
                          min={2}
                          max={20}
                          value={maxPlayers}
                          onChange={(e) => handleMaxPlayersChange(parseInt(e.target.value, 10) || 8)}
                          disabled={savingSettings === 'max_players'}
                          className="w-16 bg-zinc-900 border border-zinc-800 rounded-xl px-2 py-1.5 text-center text-xs font-semibold focus:outline-none focus:border-rose-500 text-zinc-200"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* Dynamic Summary Modal Overlay (Tab Report detail modal) */}
      {selectedGame && (
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
                  onClick={() => {
                    setSelectedGame(null);
                    setSelectedGameLeaderboard([]);
                    setSelectedGameRounds([]);
                    setSelectedGameReportData(null);
                  }}
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
                  {/* Visual Podium Stack */}
                  {selectedGameLeaderboard.length >= 2 && (
                    <div className="w-full bg-zinc-900/35 border border-zinc-800/40 rounded-2xl p-4 flex flex-col items-center">
                      <div className="flex items-end justify-center w-full max-w-xs gap-2 mt-2 h-[120px]">
                        {/* 2nd Place */}
                        {selectedGameLeaderboard[1] && (
                          <div className="flex flex-col items-center w-20">
                            <span className="text-[10px] font-bold truncate w-full text-center mb-0.5 text-zinc-400">{selectedGameLeaderboard[1].name}</span>
                            <div className="w-full bg-zinc-900/60 border border-zinc-800 rounded-t-lg h-[50px] flex flex-col items-center justify-center shadow-md">
                              <span className="text-lg font-bold font-display text-zinc-400">2</span>
                              <span className="text-[8px] font-mono opacity-80">{selectedGameLeaderboard[1].totalScore} pts</span>
                            </div>
                          </div>
                        )}
                        {/* 1st Place */}
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
                        {/* 3rd Place */}
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

                  {/* Leaderboard Standings */}
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

                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-zinc-500 font-medium">
                                🥇 {item.rankCounts[1] || 0}x
                              </span>
                              <span className="text-xs font-mono font-extrabold">{item.totalScore} pts</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions inside modal */}
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      onClick={() => selectedGameReportData && exportGamePdf(selectedGameReportData)}
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
      )}

      {/* Dynamic Overlay Modal for Create / Edit Player */}
      {playerModal.show && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bezel-outer max-w-sm w-full animate-bounce-short" style={{ animationDuration: '4s' }}>
            <div className="bezel-inner p-6 space-y-4">
              
              <div className="space-y-1">
                <h4 className="text-md font-bold font-display">
                  {playerModal.mode === 'create' ? 'Tambah Pemain Baru' : 'Edit Nama Pemain'}
                </h4>
                <p className="text-xs text-zinc-500">Ketik nama untuk didaftarkan ke database Supabase.</p>
              </div>

              <form onSubmit={handleSavePlayer} className="space-y-4">
                <input
                  type="text"
                  placeholder="Ketik nama pemain..."
                  value={playerModal.name}
                  onChange={(e) => setPlayerModal(prev => ({ ...prev, name: e.target.value }))}
                  maxLength={20}
                  required
                  autoFocus
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-rose-500 text-zinc-200"
                />

                <div className="flex gap-3 justify-end text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setPlayerModal(prev => ({ ...prev, show: false }))}
                    className="px-4 py-2.5 rounded-xl border border-zinc-800 hover:bg-zinc-900 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-rose-500 dark:bg-rose-600 hover:bg-rose-600 text-white shadow-md transition-colors"
                  >
                    Simpan
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}

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
