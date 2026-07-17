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
    <div className="space-y-6 select-none font-mono animate-fade-in text-[#E2E8F0]">
      
      {/* Top Banner Verification Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0E0E12] border-2 border-zinc-800 p-6 rounded-none relative">
        <span className="absolute -top-2 -left-2 font-black text-red-500 select-none">+</span >
        <span className="absolute -top-2 -right-2 font-black text-red-500 select-none">+</span >
        <span className="absolute -bottom-3 -left-2 font-black text-red-500 select-none">+</span >
        <span className="absolute -bottom-3 -right-2 font-black text-red-500 select-none">+</span >

        <div className="space-y-1">
          <h2 className="text-base font-black uppercase text-white tracking-widest">
            [ ADMIN GATEWAY SESSION // CALIBRATION_OK ]
          </h2>
          <p className="text-[10px] text-zinc-500 uppercase">
            LIVE TELEMETRY SUMMARY OF CORE UNO DATABASES AND SYSTEM RUNTIME CONSTANTS.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 text-green-500 text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-none">
          <CheckCircle2 className="w-3.5 h-3.5" />
          [ SYS_HEALTH: OK ]
        </div>
      </div>

      {/* Grid readouts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        {/* Players Card */}
        <div 
          className="border border-zinc-800 bg-[#0C0C0F] p-6 space-y-4 cursor-pointer hover:border-red-500 transition-colors rounded-none relative group" 
          onClick={() => onNavigateToTab('player')}
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">
                [ 01 // REGISTERED_PLAYERS ]
              </p>
              <p className="text-3xl font-black text-white group-hover:text-red-500 transition-colors">
                {playersCount}
              </p>
            </div>
            <div className="p-2.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-none">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[9px] text-zinc-500 uppercase">
            &gt;&gt;&gt; READ / WRITE NAMES DATABASE
          </p>
        </div>

        {/* Reports Card */}
        <div 
          className="border border-zinc-800 bg-[#0C0C0F] p-6 space-y-4 cursor-pointer hover:border-red-500 transition-colors rounded-none relative group" 
          onClick={() => onNavigateToTab('report')}
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">
                [ 02 // HISTORICAL_REPORTS ]
              </p>
              <p className="text-3xl font-black text-white group-hover:text-red-500 transition-colors">
                {gamesCount}
              </p>
            </div>
            <div className="p-2.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-none">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[9px] text-zinc-500 uppercase">
            &gt;&gt;&gt; ANALYZE MATCH LOG HISTORIES
          </p>
        </div>

        {/* Maintenance Card */}
        <div 
          className="border border-zinc-800 bg-[#0C0C0F] p-6 space-y-4 cursor-pointer hover:border-red-500 transition-colors rounded-none relative group" 
          onClick={() => onNavigateToTab('setting')}
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">
                [ 03 // MAINTENANCE_MODE ]
              </p>
              <p className={`text-[10px] font-black tracking-widest uppercase border px-2.5 py-0.5 mt-2 rounded-none inline-block
                ${maintenanceMode 
                  ? 'bg-red-500/10 text-red-500 border-red-500/30 font-black' 
                  : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                }
              `}>
                {maintenanceMode ? '[ ACTIVE ]' : '[ OFF ]'}
              </p>
            </div>
            <div className="p-2.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-none">
              <Settings className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[9px] text-zinc-500 uppercase">
            &gt;&gt;&gt; EDIT PRIVILEGE GATEWAYS
          </p>
        </div>

      </div>

      {/* Connectivity specifications table */}
      <div className="border border-zinc-800 bg-[#0C0C0F] p-6 space-y-5 rounded-none relative">
        <h3 className="text-xs font-black uppercase text-[#FFFFFF] tracking-wider flex items-center gap-2">
          <Shield className="w-4 h-4 text-red-500" />
          [ CORE CONNECTIVITY & DATA READOUTS ]
        </h3>

        <div className="w-full h-px bg-zinc-800" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 md:gap-y-0 text-[11px] text-zinc-500 font-mono uppercase">
          
          <div className="space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-6 py-1.5 border-b border-zinc-900">
              <span className="text-zinc-600 shrink-0">DATABASE ENGINE</span>
              <span className="font-bold text-zinc-300 truncate" title={dbEngine}>{dbEngine}</span>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-6 py-1.5 border-b border-zinc-900">
              <span className="text-zinc-600 shrink-0">API CONNECTIVITY</span>
              {apiConnected === 'checking' && (
                <span className="text-zinc-400 font-bold">[ CHECKING... ]</span>
              )}
              {apiConnected === true && (
                <span className="text-green-500 font-black">[ CONNECTED_OK ]</span>
              )}
              {apiConnected === false && (
                <span className="text-red-500 font-black">[ DISCONNECTED_ERROR ]</span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-6 py-1.5 border-b border-zinc-900">
              <span className="text-zinc-600 shrink-0">REALTIME SETTINGS</span>
              {settingsActive === 'checking' && (
                <span className="text-zinc-400 font-bold">[ CHECKING... ]</span>
              )}
              {settingsActive === true && (
                <span className="text-green-500 font-black">[ SYNCHRONIZED ]</span>
              )}
              {settingsActive === false && (
                <span className="text-red-500 font-black">[ SYNC_FAIL ]</span>
              )}
            </div>
          </div>

          <div className="space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-6 py-1.5 border-b border-zinc-900">
              <span className="text-zinc-600 shrink-0">SUPABASE RLS POLICY</span>
              {rlsActive === 'checking' && (
                <span className="text-zinc-400 font-bold">[ CHECKING... ]</span>
              )}
              {rlsActive === true && (
                <span className="text-green-500 font-black">[ RLS_ACTIVE_SECURE ]</span>
              )}
              {rlsActive === false && (
                <span className="text-red-500 font-black">[ INSECURE_WARNING ]</span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-6 py-1.5 border-b border-zinc-900">
              <span className="text-zinc-600 shrink-0">LATENCY BENCHMARK</span>
              <span className="font-bold text-zinc-300">
                {latency !== null ? `${latency} MS` : '[ MEASURING... ]'}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-6 py-1.5 border-b border-zinc-900">
              <span className="text-zinc-600 shrink-0">SERVER INFRA LOCATION</span>
              <span className="font-bold text-zinc-300 truncate" title={serverLocation}>{serverLocation}</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
