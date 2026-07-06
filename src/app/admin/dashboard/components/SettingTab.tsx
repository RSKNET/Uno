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
    <div className="space-y-6 animate-fade-in w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/30 border border-zinc-800/50 p-6 rounded-3xl backdrop-blur-sm mb-2">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight font-display text-gradient">Pengaturan Sistem</h2>
          <p className="text-xs text-zinc-400 mt-1">Konfigurasi batasan match, mode pemeliharaan, dan default parameter permainan.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full items-start">
        <div className="bezel-outer w-full">
          <div className="bezel-inner p-6 space-y-5">
            <h3 className="text-sm font-bold font-display flex items-center gap-2 text-zinc-200">
              <ShieldAlert className="w-4.5 h-4.5 text-red-500 shrink-0" />
              Status & Akses Keamanan
            </h3>
            
            <div className="w-full h-px bg-zinc-800/60" />
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
                onClick={() => onToggleMaintenance(!maintenanceMode)}
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
        <div className="bezel-outer w-full">
          <div className="bezel-inner p-6 space-y-5">
            <h3 className="text-sm font-bold font-display flex items-center gap-2 text-zinc-200">
              <Sliders className="w-4.5 h-4.5 text-rose-500 shrink-0" />
              Konfigurasi Default Permainan
            </h3>

            <div className="w-full h-px bg-zinc-800/60" />

            <div className="space-y-6">
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
                  onClick={() => onToggleUnlimitedRounds(!unlimitedRounds)}
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
                    onChange={(e) => onMaxPlayersChange(parseInt(e.target.value, 10) || 8)}
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
  );
}
