"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Play, Loader2, UserCheck, AlertTriangle } from 'lucide-react';
import { getInitialSetupData } from '@/app/actions/public';
import { localDb } from '@/lib/db';
import { CustomModal } from '@/components/modal';

// design-taste-frontend Configuration:
// DESIGN_VARIANCE: 9
// MOTION_INTENSITY: 5
// VISUAL_DENSITY: 8

const uuidv4Custom = () => {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const setupSchema = z.object({
  totalPlayers: z.number().min(2, 'Minimal 2 pemain').max(20, 'Maksimal 20 pemain'),
  totalRounds: z.number().min(1, 'Minimal 1 babak'),
  isUnlimitedRounds: z.boolean(),
  players: z.array(z.object({
    name: z.string().min(1, 'Nama tidak boleh kosong').max(20, 'Nama terlalu panjang'),
    id: z.string(),
    isMatched: z.boolean()
  })).min(2, 'Minimal 2 pemain')
}).refine((data) => {
  const names = data.players.map(p => p.name.trim().toLowerCase());
  return new Set(names).size === names.length;
}, {
  message: "Nama pemain tidak boleh ada yang sama!",
  path: ["players"]
});

type SetupFormValues = z.infer<typeof setupSchema>;

export default function SetupPage() {
  const router = useRouter();

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<SetupFormValues>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      totalPlayers: 2,
      totalRounds: 5,
      isUnlimitedRounds: false,
      players: [
        { name: '', id: '', isMatched: false },
        { name: '', id: '', isMatched: false }
      ]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'players'
  });

  const [loading, setLoading] = useState(false);
  const [dbPlayers, setDbPlayers] = useState<{ id: string; name: string }[]>([]);
  const [maxPlayersLimit, setMaxPlayersLimit] = useState<number>(8);
  const [activeSugIdx, setActiveSugIdx] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<{ id: string; name: string }[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [systemTime, setSystemTime] = useState("");

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
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Jakarta',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      };
      const formatter = new Intl.DateTimeFormat('sv-SE', options);
      setSystemTime(formatter.format(now));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadSettingsAndPlayers = async () => {
      try {
        const { players: playersData, settings: settingsData } = await getInitialSetupData();
        
        if (playersData) {
          await localDb.playersCache.clear();
          await localDb.playersCache.bulkPut(playersData);
          setDbPlayers(playersData);
        }

        if (settingsData) {
          const limit = settingsData.find(s => s.key === 'max_players')?.value;
          if (limit) {
            const limitNum = parseInt(limit);
            setMaxPlayersLimit(limitNum);
            
            const currentPlayers = watch('totalPlayers');
            if (currentPlayers > limitNum) {
              setValue('totalPlayers', limitNum);
            }
          }

          const unlimitDefault = settingsData.find(s => s.key === 'unlimited_rounds')?.value === 'true';
          setValue('isUnlimitedRounds', unlimitDefault);
        }
      } catch (err) {
        const cachedPlayers = await localDb.playersCache.toArray();
        setDbPlayers(cachedPlayers);
      }
    };

    loadSettingsAndPlayers();
  }, [setValue, watch]);

  const totalPlayersWatch = watch('totalPlayers');
  const isUnlimitedRoundsWatch = watch('isUnlimitedRounds');
  const playersWatch = watch('players');

  useEffect(() => {
    const currentCount = fields.length;
    if (totalPlayersWatch > currentCount) {
      for (let i = currentCount; i < totalPlayersWatch; i++) {
        append({ name: '', id: `local-${uuidv4Custom()}`, isMatched: false });
      }
    } else if (totalPlayersWatch < currentCount) {
      for (let i = currentCount; i > totalPlayersWatch; i--) {
        remove(i - 1);
      }
    }
  }, [totalPlayersWatch, fields.length, append, remove]);

  const checkPlayerName = async (index: number, name: string) => {
    if (!name.trim()) {
      setValue(`players.${index}.id`, `local-${uuidv4Custom()}`);
      setValue(`players.${index}.isMatched`, false);
      setActiveSugIdx(null);
      setSuggestions([]);
      return;
    }

    const trimmed = name.trim().toLowerCase();
    const match = dbPlayers.find(p => p.name.toLowerCase() === trimmed);

    if (match) {
      setValue(`players.${index}.id`, match.id);
      setValue(`players.${index}.isMatched`, true);
    } else {
      setValue(`players.${index}.id`, `local-${uuidv4Custom()}`);
      setValue(`players.${index}.isMatched`, false);
    }

    if (name.trim().length >= 2) {
      const filtered = dbPlayers
        .filter(p => p.name.toLowerCase().includes(trimmed))
        .slice(0, 5);
      setSuggestions(filtered);
      setActiveSugIdx(index);
    } else {
      setSuggestions([]);
      setActiveSugIdx(null);
    }
  };

  const onSubmit = async (data: SetupFormValues) => {
    setLoading(true);
    try {
      const now = Date.now();
      const gameId = uuidv4Custom();
      const playersList = data.players.map(p => {
        const id = p.id || `local-${uuidv4Custom()}`;
        const capitalizedName = p.name.trim().replace(/\b\w/g, l => l.toUpperCase());
        return { id, name: capitalizedName };
      });

      const gameCacheItem = {
        id: gameId,
        totalPlayers: data.totalPlayers,
        totalRounds: data.isUnlimitedRounds ? 9999 : data.totalRounds,
        isUnlimitedRounds: data.isUnlimitedRounds,
        players: playersList,
        rounds: [],
        status: 'active' as const,
        isSynced: 0,
        createdAt: now
      };

      await localDb.gamesCache.put(gameCacheItem);

      for (const p of playersList) {
        if (p.id.startsWith('local-')) {
          await localDb.playersCache.put({ id: p.id, name: p.name });
        }
      }

      await localDb.syncQueue.put({
        type: 'game',
        payload: gameCacheItem,
        createdAt: now
      });

      if (navigator.onLine) {
        import('@/lib/sync').then(m => m.syncOfflineData());
      }

      router.push(`/game/${gameId}`);
    } catch (err) {
      showModal(
        "Gagal Memulai",
        "Gagal memulai permainan.",
        () => {},
        'alert',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const playerButtons = Array.from({ length: maxPlayersLimit - 1 }, (_, i) => i + 2);

  return (
    <div className="flex min-h-screen flex-col bg-[#0A0A0C] text-[#E2E8F0] font-mono crt-screen relative overflow-x-hidden select-none">
      
      {/* Top Banner / System Telemetry Bar */}
      <header className="w-full border-b border-zinc-800 bg-[#0C0C0E]/90 backdrop-blur-sm px-6 py-3 flex flex-wrap items-center justify-between z-40 text-[11px] tracking-wider text-zinc-500">
        <div className="flex items-center gap-4">
          <span className="text-red-500 font-black tracking-widest uppercase">
            [ UNO_CORE // SYS_ACTIVE ]
          </span>
        </div>
        <div className="flex items-center gap-4 mt-1 sm:mt-0">
          <span className="uppercase">
            NET_STATUS: {isOnline ? (
              <span className="text-green-500 font-extrabold">[ ONLINE ]</span>
            ) : (
              <span className="text-red-500 font-extrabold">[ OFFLINE ]</span>
            )}
          </span>
          <span className="hidden md:inline text-zinc-600">|</span>
          <span className="text-zinc-400 font-medium">
            {systemTime}
          </span>
        </div>
      </header>

      {/* Main Grid Workspace */}
      <main className="flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-y-12 lg:gap-0 lg:divide-x lg:divide-zinc-800 border-t border-zinc-800 relative z-10">
        
        {/* Left Side: System Specifications / Visuals */}
        <section className="lg:col-span-5 p-8 flex flex-col justify-between space-y-12 min-h-full">
          <div className="space-y-8">
            {/* Title Block - Compressed, monolithic */}
            <div className="space-y-4">
              <span className="text-[10px] text-red-500 tracking-[0.25em] uppercase block font-black">
                &gt;&gt;&gt; SYSTEM_PROT_v2.6
              </span>
              <h1 className="text-6xl sm:text-7xl font-black uppercase tracking-tighter leading-[0.85] text-[#FFFFFF]">
                UNO<br />
                MATRIX
              </h1>
              <div className="w-16 h-1.5 bg-red-600 mt-2" />
            </div>

            {/* Micro-telemetry details */}
            <div className="space-y-2.5 text-xs text-zinc-400">
              <p className="font-semibold text-zinc-300">// PROTOCOL OBJECTIVES:</p>
              <div className="space-y-1 text-zinc-400">
                <p>01. AUTOMATIC POIN CALCULATION MATRIX</p>
                <p>02. ANTI-TIE PARITY CHECKER [ENABLED]</p>
                <p>03. SYNC QUEUE BUFFER PIPELINE [DEXIE_DB]</p>
                <p>04. RAW METRIC REPORT GENERATOR</p>
              </div>
            </div>

            {/* Hazard Warning Stripe segment */}
            <div className="w-full h-8 hazard-stripes border border-red-500/20" />

            {/* Technical system logs container */}
            <div className="border border-zinc-800 bg-[#0E0E12] p-4 text-[10px] space-y-1.5 font-mono text-zinc-400">
              <p className="text-zinc-300 font-bold uppercase"># CURRENT SESSION TELEMETRY</p>
              <p>ENGINE: DEXIE_DB_CLIENT_CACHE</p>
              <p>QUEUE: {dbPlayers.length} REGISTERED PLAYERS IN DB</p>
              <p>STATUS: READY FOR MATCH INITIALIZATION</p>
              <p className="text-red-400 font-bold">WARNING: AVOID REFRESH DURING PLAY SEQUENCE</p>
            </div>
          </div>

          {/* Barcode Graphic */}
          <div className="space-y-2">
            <span className="text-[9px] text-zinc-400 block uppercase tracking-widest">
              PRODUCT SERIAL: 2026-UNO-GRID-0717
            </span>
            <svg className="w-48 h-8 opacity-40 text-[#E2E8F0]" viewBox="0 0 100 20" fill="currentColor">
              <rect x="0" width="2" height="20" />
              <rect x="3" width="1" height="20" />
              <rect x="5" width="4" height="20" />
              <rect x="10" width="1" height="20" />
              <rect x="12" width="2" height="20" />
              <rect x="15" width="3" height="20" />
              <rect x="20" width="1" height="20" />
              <rect x="22" width="5" height="20" />
              <rect x="28" width="2" height="20" />
              <rect x="31" width="1" height="20" />
              <rect x="33" width="4" height="20" />
              <rect x="38" width="2" height="20" />
              <rect x="42" width="1" height="20" />
              <rect x="44" width="3" height="20" />
              <rect x="48" width="1" height="20" />
              <rect x="50" width="6" height="20" />
              <rect x="58" width="2" height="20" />
              <rect x="61" width="1" height="20" />
              <rect x="63" width="4" height="20" />
              <rect x="68" width="2" height="20" />
              <rect x="71" width="1" height="20" />
              <rect x="73" width="3" height="20" />
              <rect x="78" width="1" height="20" />
              <rect x="80" width="5" height="20" />
              <rect x="86" width="2" height="20" />
              <rect x="89" width="1" height="20" />
              <rect x="91" width="4" height="20" />
              <rect x="96" width="2" height="20" />
              <rect x="99" width="1" height="20" />
            </svg>
          </div>
        </section>

        {/* Right Side: Setup Controls */}
        <section className="lg:col-span-7 p-8 flex flex-col justify-center min-h-full">
          <div className="max-w-3xl w-full mx-auto border-2 border-zinc-800 bg-[#0C0C0F] relative">
            
            {/* Tactical Grid Crosshairs */}
            <span className="absolute -top-2 -left-2 font-black text-red-500 select-none">+</span >
            <span className="absolute -top-2 -right-2 font-black text-red-500 select-none">+</span >
            <span className="absolute -bottom-3 -left-2 font-black text-red-500 select-none">+</span >
            <span className="absolute -bottom-3 -right-2 font-black text-red-500 select-none">+</span >

            {/* Header info */}
            <div className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between bg-[#0E0E12]">
              <span className="text-xs font-black uppercase tracking-widest text-[#FFFFFF]">
                [ PARAMETERS CONFIGURATION ]
              </span>
              <span className="text-[10px] text-zinc-300 uppercase tracking-widest font-semibold">
                SYSTEM ID: S_001
              </span>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              
              {/* Total Players input */}
              <div className="space-y-2">
                <label htmlFor="totalPlayers" className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                  [ 01 // TOTAL OPERATIONAL PLAYERS ]
                </label>
                <select
                  id="totalPlayers"
                  value={totalPlayersWatch}
                  onChange={(e) => setValue('totalPlayers', parseInt(e.target.value) || 2)}
                  className="w-full bg-[#121216] border border-zinc-800 rounded-none px-3.5 py-2.5 text-xs text-[#E2E8F0] font-bold focus:outline-none focus:border-red-500 focus:ring-0 appearance-none uppercase cursor-pointer"
                >
                  {playerButtons.map((num) => (
                    <option key={num} value={num} className="bg-[#0A0A0C]">
                      {num} PLAYERS MATRIX
                    </option>
                  ))}
                </select>
              </div>

              {/* Rounds input details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="totalRounds" className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                    [ 02 // TOTAL ROUNDS ]
                  </label>
                  <input
                    id="totalRounds"
                    type="number"
                    disabled={isUnlimitedRoundsWatch}
                    {...register('totalRounds', { valueAsNumber: true })}
                    className="w-full bg-[#121216] border border-zinc-800 rounded-none px-3.5 py-2 text-xs font-bold focus:outline-none focus:border-red-500 disabled:opacity-30 disabled:cursor-not-allowed uppercase"
                  />
                  {errors.totalRounds && (
                    <p className="text-[10px] text-red-500 mt-1 uppercase font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 shrink-0" />
                      {errors.totalRounds.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-3 px-4 py-2 bg-[#121216] border border-zinc-800 rounded-none cursor-pointer hover:bg-zinc-900 transition-colors h-[38px] select-none text-xs font-bold text-zinc-300">
                    <input
                      type="checkbox"
                      {...register('isUnlimitedRounds')}
                      className="rounded-none border-zinc-800 text-red-600 focus:ring-0 focus:ring-offset-0 bg-[#0A0A0C] h-4 w-4"
                    />
                    <span className="uppercase">[ UNLIMITED PLAY SEQUENCE ]</span>
                  </label>
                </div>
              </div>

              <div className="w-full h-px bg-zinc-800" />

              {/* Player Names Configuration */}
              <div className="space-y-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                  [ 03 // PLAYERS IDENTITY PROTOCOL ]
                </label>
                
                {errors.players && (
                  <p className="text-xs text-red-500 font-bold bg-red-500/10 border border-red-500/30 px-3.5 py-2.5 rounded-none flex items-center gap-2 uppercase">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    {errors.players.message || errors.players.root?.message}
                  </p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-1">
                  {fields.map((field, index) => (
                    <div key={field.id} className="relative flex flex-col gap-1">
                      <span className="text-[9px] text-zinc-400 uppercase tracking-widest">
                        PLAYER_{String(index + 1).padStart(2, '0')}
                      </span>
                      <input
                        type="text"
                        placeholder={`NAME FOR PLAYER ${index + 1}`}
                        aria-label={`Nama Pemain ${index + 1}`}
                        {...register(`players.${index}.name` as const, {
                          onChange: (e) => {
                            checkPlayerName(index, e.target.value);
                          },
                          onBlur: () => {
                            setTimeout(() => {
                              setActiveSugIdx(null);
                            }, 180);
                          }
                        })}
                        onFocus={(e) => {
                          checkPlayerName(index, e.target.value);
                        }}
                        className={`w-full bg-[#121216] border rounded-none px-3.5 py-2 text-xs font-bold focus:outline-none transition-colors uppercase
                          ${errors.players?.[index]?.name 
                            ? 'border-red-500 focus:border-red-500' 
                            : 'border-zinc-800 focus:border-red-500'
                          }
                        `}
                      />

                      {/* Autocomplete Suggestions dropdown */}
                      {activeSugIdx === index && suggestions.length > 0 && (
                        <div className="absolute left-0 right-0 top-[52px] bg-[#0A0A0C] border-2 border-red-500 rounded-none shadow-2xl z-50 max-h-[150px] overflow-y-auto select-none">
                          {suggestions.map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onMouseDown={() => {
                                setValue(`players.${index}.name`, p.name);
                                setValue(`players.${index}.id`, p.id);
                                setValue(`players.${index}.isMatched`, true);
                                setActiveSugIdx(null);
                                setSuggestions([]);
                              }}
                              className="w-full text-left px-3.5 py-2 hover:bg-red-500 hover:text-white text-[10px] font-bold text-zinc-300 border-b border-zinc-900 last:border-0 transition-colors uppercase"
                            >
                              {p.name} [SYS_STORED]
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Match Status Badge */}
                      {playersWatch?.[index]?.isMatched && (
                        <div className="absolute right-2 bottom-2.5 flex items-center gap-1 bg-green-500/10 text-green-500 border border-green-500/30 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider select-none">
                          <UserCheck className="w-2.5 h-2.5" />
                          [OK]
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit trigger */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-zinc-800 text-white font-black py-4 px-6 text-xs tracking-[0.2em] transition-colors border-b-4 border-red-800 active:border-b-0 active:translate-y-1 disabled:opacity-40 disabled:pointer-events-none uppercase cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    [ PREPARING GRID MATRIX... ]
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    [ INITIATE MATCH SEQUENCE ]
                  </>
                )}
              </button>

            </form>
          </div>
        </section>

      </main>

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
