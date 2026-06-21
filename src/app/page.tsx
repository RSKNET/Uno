"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Play, Users, Trophy, Loader2, Sparkles, UserCheck, Swords } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { localDb } from '@/lib/db';
import { CustomModal } from '@/components/modal';

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
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dbPlayers, setDbPlayers] = useState<{ id: string; name: string }[]>([]);
  const [maxPlayersLimit, setMaxPlayersLimit] = useState<number>(8);
  const [activeSugIdx, setActiveSugIdx] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<{ id: string; name: string }[]>([]);

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

    const loadSettingsAndPlayers = async () => {
      try {
        const { data: playersData, error: playersError } = await supabase.from('players').select('id, name');
        if (playersError) throw playersError;
        
        if (playersData) {
          await localDb.playersCache.clear();
          await localDb.playersCache.bulkPut(playersData);
          setDbPlayers(playersData);
        }

        const { data: settingsData, error: settingsError } = await supabase.from('settings').select('key, value');
        if (settingsError) throw settingsError;

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
        console.warn('Fallback settings & players (offline mode):', err);
        const cachedPlayers = await localDb.playersCache.toArray();
        setDbPlayers(cachedPlayers);
      }
    };

    loadSettingsAndPlayers();
  }, []);

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
        createdAt: Date.now()
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
        createdAt: Date.now()
      });

      if (navigator.onLine) {
        import('@/lib/sync').then(m => m.syncOfflineData());
      }

      router.push(`/game/${gameId}`);
    } catch (err) {
      console.error(err);
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

  if (!mounted) return null;

  const playerButtons = Array.from({ length: maxPlayersLimit - 1 }, (_, i) => i + 2);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-[#050505] text-zinc-950 dark:text-zinc-50 relative overflow-hidden transition-colors duration-500">
      
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-rose-500/5 blur-[120px] pointer-events-none dark:block hidden" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-red-500/5 blur-[140px] pointer-events-none dark:block hidden" />

      <header className="fixed top-0 left-0 w-full flex items-center justify-between px-6 py-4 z-40 backdrop-blur-md bg-transparent">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-rose-500/10">
            U
          </div>
          <span className="font-display font-extrabold tracking-tight text-lg bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-zinc-100 dark:to-zinc-400 bg-clip-text text-transparent">
            UNO Skors
          </span>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 md:px-12 py-24 relative z-10 w-full max-w-[98%] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 w-full items-center">
          
          <div className="lg:col-span-5 space-y-8 text-center lg:text-left">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 dark:text-rose-400 border border-rose-500/15 text-[10px] font-bold tracking-widest uppercase font-display mx-auto lg:mx-0">
                <Sparkles className="w-3 h-3" />
                Catat Skor Instan
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight font-display bg-gradient-to-r from-zinc-950 via-zinc-900 to-rose-600 dark:from-zinc-50 dark:via-zinc-100 dark:to-rose-400 bg-clip-text text-transparent leading-[1.15]">
                Papan Skor UNO Digital
              </h1>
              <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-md mx-auto lg:mx-0">
                Lupakan kertas dan pulpen. Catat skor pertandingan UNO Anda bersama teman dengan sistem poin berbobot otomatis, aturan anti-seri, diagram performa real-time, dan ekspor PDF instan.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 text-left max-w-md mx-auto lg:mx-0">
              <div className="flex items-start gap-3 bg-white/40 dark:bg-zinc-900/20 border border-zinc-200/50 dark:border-zinc-800/40 p-4 rounded-2xl backdrop-blur-sm">
                <div className="p-2 bg-rose-500/10 text-rose-500 rounded-lg shrink-0">
                  <Swords className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Aturan Anti-Seri</h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Sistem otomatis memecahkan skor seri berdasarkan rekapitulasi kemenangan tertinggi.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white/40 dark:bg-zinc-900/20 border border-zinc-200/50 dark:border-zinc-800/40 p-4 rounded-2xl backdrop-blur-sm">
                <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg shrink-0">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Main Offline / Online</h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Data aman di lokal saat koneksi terputus dan otomatis disinkronkan saat terhubung kembali.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 w-full max-w-md mx-auto lg:max-w-none">
            <div className="bezel-outer w-full">
              <div className="bezel-inner p-6 sm:p-8 space-y-6">
                
                <h3 className="text-lg font-bold font-display flex items-center gap-2">
                  <Users className="w-5 h-5 text-rose-500" /> Pengaturan Match
                </h3>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2 mb-2">
                      Jumlah Pemain
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {playerButtons.map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setValue('totalPlayers', num)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all duration-300 flex-1 min-w-[40px]
                            ${totalPlayersWatch === num
                              ? 'bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-500/20'
                              : 'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                            }
                          `}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2 mb-2">
                        Jumlah Babak
                      </label>
                      <input
                        type="number"
                        disabled={isUnlimitedRoundsWatch}
                        {...register('totalRounds', { valueAsNumber: true })}
                        className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:border-rose-500 dark:focus:border-rose-500 disabled:opacity-40 transition-colors"
                      />
                      {errors.totalRounds && (
                        <p className="text-xs text-red-500 mt-1">{errors.totalRounds.message}</p>
                      )}
                    </div>

                    <div className="flex flex-col justify-end">
                      <label className="flex items-center gap-3 px-3 py-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors h-[38px] select-none">
                        <input
                          type="checkbox"
                          {...register('isUnlimitedRounds')}
                          className="rounded border-zinc-300 text-rose-600 focus:ring-rose-500 h-4 w-4 dark:bg-zinc-950 dark:border-zinc-800"
                        />
                        <span className="text-xs font-semibold">Babak Bebas</span>
                      </label>
                    </div>
                  </div>

                  <div className="w-full h-px bg-zinc-200 dark:bg-zinc-800/80" />

                  <div className="space-y-4">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                      Nama Pemain
                    </label>
                    
                    {errors.players && (
                      <p className="text-xs text-red-500 font-medium bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-xl">
                        {errors.players.message || errors.players.root?.message}
                      </p>
                    )}

                    <div className="space-y-3 pr-1">
                      {fields.map((field, index) => (
                        <div key={field.id} className="relative flex flex-col gap-1.5">
                          <input
                            type="text"
                            placeholder={`Pemain ${index + 1}`}
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
                            className={`w-full bg-zinc-100 dark:bg-zinc-900 border rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none transition-all pr-24
                              ${errors.players?.[index]?.name 
                                ? 'border-red-500 focus:border-red-500' 
                                : 'border-zinc-200 dark:border-zinc-800 focus:border-rose-500 dark:focus:border-rose-500'
                              }
                            `}
                          />

                          {activeSugIdx === index && suggestions.length > 0 && (
                            <div className="absolute left-0 right-0 top-[42px] bg-zinc-950 border border-zinc-800 rounded-xl shadow-xl z-50 max-h-[150px] overflow-y-auto select-none">
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
                                  className="w-full text-left px-3.5 py-2.5 hover:bg-zinc-900 text-xs font-semibold text-zinc-200 border-b border-zinc-900 last:border-0 transition-colors"
                                >
                                  {p.name}
                                </button>
                              ))}
                            </div>
                          )}

                          {playersWatch?.[index]?.isMatched && (
                            <div className="absolute right-2 top-[30px] sm:top-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide select-none animate-fade-in">
                              <UserCheck className="w-2.5 h-2.5" />
                              Pemain Terdaftar
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-rose-500 dark:bg-rose-600 text-white py-3.5 text-sm font-bold transition-all hover:bg-rose-600 dark:hover:bg-rose-700 shadow-lg shadow-rose-500/20 active:scale-[0.98] disabled:opacity-50 mt-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Menyiapkan Papan...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-current" />
                        Mulai Game Sekarang
                      </>
                    )}
                  </button>

                </form>
              </div>
            </div>
          </div>

        </div>
      </div>

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
