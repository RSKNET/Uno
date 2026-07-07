"use client";

import { 
  CheckCircle2, 
  Users, 
  FileText, 
  Settings, 
  Shield 
} from 'lucide-react';

interface DashboardTabProps {
  playersCount: number;
  gamesCount: number;
  maintenanceMode: boolean;
  dbEngine: string;
  apiConnected: boolean | 'checking';
  settingsActive: boolean | 'checking';
  rlsActive: boolean | 'checking';
  latency: number | null;
  serverLocation: string;
  onNavigateToTab: (tab: 'dashboard' | 'player' | 'report' | 'setting') => void;
}

export default function DashboardTab({
  playersCount,
  gamesCount,
  maintenanceMode,
  dbEngine,
  apiConnected,
  settingsActive,
  rlsActive,
  latency,
  serverLocation,
  onNavigateToTab
}: DashboardTabProps) {
  return (
    <div className="space-y-6 animate-fade-in">
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bezel-outer">
          <div 
            className="bezel-inner p-6 space-y-4 cursor-pointer hover:border-zinc-700/50 transition-all" 
            onClick={() => onNavigateToTab('player')}
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold text-zinc-500">Pemain Terdaftar</p>
                <p className="text-2xl font-extrabold font-display">{playersCount}</p>
              </div>
              <div className="p-2.5 bg-rose-500/10 text-rose-400 border border-rose-500/15 rounded-xl">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[10px] text-zinc-400 font-semibold">Kelola database nama pemain</p>
          </div>
        </div>

        <div className="bezel-outer">
          <div 
            className="bezel-inner p-6 space-y-4 cursor-pointer hover:border-zinc-700/50 transition-all" 
            onClick={() => onNavigateToTab('report')}
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold text-zinc-500">Total Laporan Game</p>
                <p className="text-2xl font-extrabold font-display">{gamesCount}</p>
              </div>
              <div className="p-2.5 bg-rose-500/10 text-rose-400 border border-rose-500/15 rounded-xl">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[10px] text-zinc-400 font-semibold">Lihat log pertandingan historis</p>
          </div>
        </div>

        <div className="bezel-outer">
          <div 
            className="bezel-inner p-6 space-y-4 cursor-pointer hover:border-zinc-700/50 transition-all" 
            onClick={() => onNavigateToTab('setting')}
          >
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
      <div className="bezel-outer">
        <div className="bezel-inner p-6 space-y-5">
          <h3 className="text-base font-bold font-display flex items-center gap-2">
            <Shield className="w-4.5 h-4.5 text-rose-500" /> Detail Konektivitas & API Database
          </h3>

          <div className="w-full h-px bg-zinc-800/60" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 md:gap-y-0">
            <div className="space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-6 text-xs py-1.5 border-b border-zinc-900/40 sm:border-none">
                <span className="text-zinc-400 shrink-0">Database Engine</span>
                <span className="font-semibold text-zinc-200 truncate" title={dbEngine}>{dbEngine}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-6 text-xs py-1.5 border-b border-zinc-900/40 sm:border-none">
                <span className="text-zinc-400 shrink-0">Status Koneksi API</span>
                {apiConnected === 'checking' && (
                  <span className="text-zinc-400 font-semibold">Memeriksa...</span>
                )}
                {apiConnected === true && (
                  <span className="text-emerald-400 font-bold">TERHUBUNG (OK)</span>
                )}
                {apiConnected === false && (
                  <span className="text-red-500 font-bold">TERPUTUS (ERROR)</span>
                )}
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-6 text-xs py-1.5 border-b border-zinc-900/40 sm:border-none">
                <span className="text-zinc-400 shrink-0">Tabel Realtime Settings</span>
                {settingsActive === 'checking' && (
                  <span className="text-zinc-400 font-semibold">Memeriksa...</span>
                )}
                {settingsActive === true && (
                  <span className="text-emerald-400 font-semibold">Aktif & Sinkron</span>
                )}
                {settingsActive === false && (
                  <span className="text-red-500 font-semibold">Gangguan / Bermasalah</span>
                )}
              </div>
            </div>

            <div className="space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-6 text-xs py-1.5 border-b border-zinc-900/40 sm:border-none">
                <span className="text-zinc-400 shrink-0">Supabase RLS Policy</span>
                {rlsActive === 'checking' && (
                  <span className="text-zinc-400 font-semibold">Memeriksa...</span>
                )}
                {rlsActive === true && (
                  <span className="text-emerald-400 font-semibold">Aktif (Aman)</span>
                )}
                {rlsActive === false && (
                  <span className="text-red-500 font-semibold">TIDAK AMAN (Non-RLS)</span>
                )}
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-6 text-xs py-1.5 border-b border-zinc-900/40 sm:border-none">
                <span className="text-zinc-400 shrink-0">Latency Check</span>
                <span className="font-mono text-zinc-200">
                  {latency !== null ? `${latency}ms` : 'Mengukur...'}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-6 text-xs py-1.5 border-b border-zinc-900/40 sm:border-none">
                <span className="text-zinc-400 shrink-0">Lokasi Server</span>
                <span className="font-semibold text-zinc-200 truncate" title={serverLocation}>{serverLocation}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
