"use client";

import { ShieldAlert, Loader2, Sliders } from 'lucide-react';

interface SettingTabProps {
  maintenanceMode: boolean;
  unlimitedRounds: boolean;
  maxPlayers: number;
  savingSettings: string | null;
  onToggleMaintenance: (checked: boolean) => void;
  onToggleUnlimitedRounds: (checked: boolean) => void;
  onMaxPlayersChange: (value: number) => void;
}

export default function SettingTab({
  maintenanceMode,
  unlimitedRounds,
  maxPlayers,
  savingSettings,
  onToggleMaintenance,
  onToggleUnlimitedRounds,
  onMaxPlayersChange
}: SettingTabProps) {
  return (
    <div className="space-y-6 select-none font-mono animate-fade-in w-full text-[#E2E8F0]">
      
      {/* Overview header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0E0E12] border-2 border-zinc-800 p-6 rounded-none relative">
        <span className="absolute -top-2 -left-2 font-black text-red-500 select-none">+</span >
        <span className="absolute -top-2 -right-2 font-black text-red-500 select-none">+</span >
        <span className="absolute -bottom-3 -left-2 font-black text-red-500 select-none">+</span >
        <span className="absolute -bottom-3 -right-2 font-black text-red-500 select-none">+</span >

        <div className="space-y-1">
          <h2 className="text-base font-black uppercase text-white tracking-widest">
            [ SYSTEM PARAMETERS // CONFIGURATION_OK ]
          </h2>
          <p className="text-[10px] text-zinc-500 uppercase">
            MODIFY MATCH LIMITATIONS, MAINTENANCE PRIVILEGES, AND DEFAULT SYSTEM VARIABLES.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full items-start">
        
        {/* Security Settings panel */}
        <div className="border border-zinc-800 bg-[#0C0C0F] p-6 space-y-5 rounded-none relative">
          <h3 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
            [ ACCESS SECURITY CONSTANTS ]
          </h3>
          
          <div className="w-full h-px bg-zinc-800" />
          
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <span className="text-xs font-black text-zinc-300 uppercase">
                MAINTENANCE MODE
              </span>
              <p className="text-[10px] text-zinc-500 leading-normal max-w-sm uppercase">
                REROUTES ALL PUBLIC APP ACCESS IN REAL-TIME TO THE SYSTEM MAINTENANCE OVERVIEW PANEL.
              </p>
            </div>

            {/* Brutalist binary switch */}
            <div className="flex border border-zinc-800 rounded-none bg-[#0A0A0C] shrink-0 overflow-hidden">
              <button
                type="button"
                disabled={savingSettings === 'maintenance'}
                onClick={() => onToggleMaintenance(true)}
                className={`px-3 py-1.5 text-[9px] font-black uppercase transition-colors rounded-none cursor-pointer disabled:opacity-40
                  ${maintenanceMode ? 'bg-red-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}
                `}
              >
                {savingSettings === 'maintenance' ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  '[ ON ]'
                )}
              </button>
              <button
                type="button"
                disabled={savingSettings === 'maintenance'}
                onClick={() => onToggleMaintenance(false)}
                className={`px-3 py-1.5 text-[9px] font-black uppercase transition-colors rounded-none cursor-pointer disabled:opacity-40
                  ${!maintenanceMode ? 'bg-[#16161C] text-zinc-300' : 'text-zinc-500 hover:text-zinc-300'}
                `}
              >
                '[ OFF ]'
              </button>
            </div>
          </div>
        </div>

        {/* Game configuration panel */}
        <div className="border border-zinc-800 bg-[#0C0C0F] p-6 space-y-5 rounded-none relative">
          <h3 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-red-500 shrink-0" />
            [ MATCH PARAMETER SETS ]
          </h3>

          <div className="w-full h-px bg-zinc-800" />

          <div className="space-y-6">
            
            {/* Free rounds setting */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <span className="text-xs font-black text-zinc-300 uppercase">
                  UNLIMITED MATCH SEQUENCES
                </span>
                <p className="text-[10px] text-zinc-500 leading-normal max-w-sm uppercase">
                  ALLOWS NEW MATCH SETUPS TO DEFAULT TO UNLIMITED ROUND SEQUENCES BY DEFAULT.
                </p>
              </div>

              {/* Brutalist binary switch */}
              <div className="flex border border-zinc-800 rounded-none bg-[#0A0A0C] shrink-0 overflow-hidden">
                <button
                  type="button"
                  disabled={savingSettings === 'rounds'}
                  onClick={() => onToggleUnlimitedRounds(true)}
                  className={`px-3 py-1.5 text-[9px] font-black uppercase transition-colors rounded-none cursor-pointer disabled:opacity-40
                    ${unlimitedRounds ? 'bg-red-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}
                  `}
                >
                  {savingSettings === 'rounds' ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    '[ ON ]'
                  )}
                </button>
                <button
                  type="button"
                  disabled={savingSettings === 'rounds'}
                  onClick={() => onToggleUnlimitedRounds(false)}
                  className={`px-3 py-1.5 text-[9px] font-black uppercase transition-colors rounded-none cursor-pointer disabled:opacity-40
                    ${!unlimitedRounds ? 'bg-[#16161C] text-zinc-300' : 'text-zinc-500 hover:text-zinc-300'}
                  `}
                >
                  '[ OFF ]'
                </button>
              </div>
            </div>

            {/* Max players configuration */}
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1.5">
                <span className="text-xs font-black text-zinc-300 uppercase">
                  MAXIMUM PLAYERS MATRIX
                </span>
                <p className="text-[10px] text-zinc-500 leading-normal max-w-sm uppercase">
                  SPECIFIES CONTROLLER LIMIT ON MAX PLAYERS CAPABLE OF REGISTRATION PER MATCH.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <input
                  type="number"
                  min={2}
                  max={20}
                  value={maxPlayers}
                  onChange={(e) => onMaxPlayersChange(parseInt(e.target.value, 10) || 8)}
                  disabled={savingSettings === 'max_players'}
                  className="w-16 bg-[#121216] border border-zinc-800 rounded-none px-2 py-1.5 text-center text-xs font-bold focus:outline-none focus:border-red-500 text-zinc-200"
                />
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
