"use client";

import React, { useState } from 'react';
import { FileText, Trash2 } from 'lucide-react';

interface Game {
  id: string;
  total_players: number;
  total_rounds: number;
  is_unlimited_rounds: boolean;
  created_at: string;
}

interface ReportTabProps {
  games: Game[];
  onOpenSummaryModal: (game: Game) => void;
  onDeleteGames: (gameIds: string[]) => Promise<void>;
  showModal: (
    title: string,
    message: string,
    onConfirm: () => void,
    type?: 'alert' | 'confirm',
    severity?: 'info' | 'warning' | 'error' | 'success'
  ) => void;
}

export default function ReportTab({ games, onOpenSummaryModal, onDeleteGames, showModal }: ReportTabProps) {
  const [selectedGameIds, setSelectedGameIds] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  const handleSelectAll = () => {
    if (selectedGameIds.size === games.length) {
      setSelectedGameIds(new Set());
    } else {
      setSelectedGameIds(new Set(games.map(g => g.id)));
    }
  };

  const handleSelectGame = (id: string) => {
    const next = new Set(selectedGameIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedGameIds(next);
  };

  const handleDeleteSingle = (g: Game) => {
    showModal(
      "HAPUS LAPORAN GAME",
      `APAKAH ANDA YAKIN INGIN MENGHAPUS LAPORAN GAME "${g.id.slice(0, 8)}..."? BERKAS GAME INI AKAN DIHAPUS PERMANEN DARI SUPABASE STORAGE.`,
      async () => {
        setDeleting(true);
        try {
          await onDeleteGames([g.id]);
          const next = new Set(selectedGameIds);
          next.delete(g.id);
          setSelectedGameIds(next);
        } catch {
          // Handled by hook
        } finally {
          setDeleting(false);
        }
      },
      'confirm',
      'error'
    );
  };

  const handleDeleteBulk = () => {
    const count = selectedGameIds.size;
    if (count === 0) return;

    showModal(
      "HAPUS BANYAK LAPORAN",
      `APAKAH ANDA YAKIN INGIN MENGHAPUS ${count} LAPORAN GAME TERPILIH? BERKAS GAME INI AKAN DIHAPUS PERMANEN DARI SUPABASE STORAGE.`,
      async () => {
        setDeleting(true);
        try {
          await onDeleteGames(Array.from(selectedGameIds));
          setSelectedGameIds(new Set());
        } catch {
          // Handled by hook
        } finally {
          setDeleting(false);
        }
      },
      'confirm',
      'error'
    );
  };

  const isAllSelected = games.length > 0 && selectedGameIds.size === games.length;
  const isSomeSelected = selectedGameIds.size > 0 && selectedGameIds.size < games.length;

  return (
    <div className="space-y-6 select-none font-mono animate-fade-in text-[#E2E8F0] w-full">
      <div className="border border-zinc-800 bg-[#0C0C0F] p-6 space-y-5 rounded-none relative">
        <span className="absolute -top-2 -left-2 font-black text-red-500 select-none">+</span >
        <span className="absolute -top-2 -right-2 font-black text-red-500 select-none">+</span >
        <span className="absolute -bottom-3 -left-2 font-black text-red-500 select-none">+</span >
        <span className="absolute -bottom-3 -right-2 font-black text-red-500 select-none">+</span >

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-black uppercase text-white tracking-wider flex items-center gap-2">
              <FileText className="w-5 h-5 text-red-500" /> [ GAME MATCH REPORTS DATABASE ]
            </h3>
            <p className="text-[10px] text-zinc-500 uppercase leading-relaxed">
              LIST OF REGISTERED UNO MATCH RECORDS ARCHIVED IN SUPABASE STORAGE.
            </p>
          </div>

          {selectedGameIds.size > 0 && (
            <button
              onClick={handleDeleteBulk}
              disabled={deleting}
              className="self-start sm:self-center px-4 py-2 text-xs font-black bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 text-red-500 rounded-none transition-colors flex items-center gap-2 active:translate-y-0.5 disabled:opacity-50 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              [ PURGE SELECTED ({selectedGameIds.size}) ]
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 text-[10px] font-black uppercase tracking-wider">
                <th className="py-3 px-2 w-10 text-center">
                  {games.length > 0 && (
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="text-zinc-500 hover:text-zinc-300 font-bold focus:outline-none cursor-pointer"
                    >
                      {isAllSelected ? '[X]' : isSomeSelected ? '[-]' : '[ ]'}
                    </button>
                  )}
                </th>
                <th className="py-3 px-2">GAME_ID</th>
                <th className="py-3 px-2">MATCH_DATE</th>
                <th className="py-3 px-2">PLAYERS_COUNT</th>
                <th className="py-3 px-2">ROUNDS_PLAYED</th>
                <th className="py-3 px-2 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {games.map((g) => {
                const isChecked = selectedGameIds.has(g.id);
                return (
                  <tr key={g.id} className={`border-b border-zinc-900 transition-colors hover:bg-zinc-900/40 ${isChecked ? 'bg-red-500/5 hover:bg-red-500/10' : ''}`}>
                    <td className="py-3.5 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleSelectGame(g.id)}
                        className="text-zinc-500 hover:text-zinc-300 font-bold focus:outline-none cursor-pointer"
                      >
                        {isChecked ? '[X]' : '[ ]'}
                      </button>
                    </td>
                    <td className="py-3.5 px-2 font-mono text-xs text-red-500 font-semibold">{g.id.slice(0, 8).toUpperCase()}...</td>
                    <td className="py-3.5 px-2 text-[10px] text-zinc-400 uppercase">
                      {new Date(g.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).toUpperCase()}
                    </td>
                    <td className="py-3.5 px-2 text-[10px] text-zinc-300 font-bold uppercase">{g.total_players} PLAYERS</td>
                    <td className="py-3.5 px-2 text-[10px] text-zinc-400 uppercase">
                      {g.is_unlimited_rounds ? 'UNLIMITED' : `${g.total_rounds} ROUNDS`}
                    </td>
                    <td className="py-3.5 px-2 text-right">
                      <div className="inline-flex items-center gap-3">
                        <button
                          onClick={() => onOpenSummaryModal(g)}
                          className="text-[10px] font-black text-red-500 hover:text-red-400 transition-colors bg-transparent border-0 cursor-pointer uppercase"
                        >
                          [ COMPILING RINGKASAN &gt;&gt; ]
                        </button>
                        <button
                          onClick={() => handleDeleteSingle(g)}
                          disabled={deleting}
                          className="p-1.5 border border-zinc-800 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 transition-colors rounded-none cursor-pointer disabled:opacity-50"
                          title="PURGE SINGLE GAME"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {games.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[10px] text-zinc-500 italic uppercase">
                    [ NO GAME REPORTS RECORDED IN CLOUD DATABASE ]
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
