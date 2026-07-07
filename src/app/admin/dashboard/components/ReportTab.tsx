"use client";

import React, { useState } from 'react';
import { FileText, Trash2, CheckSquare, Square } from 'lucide-react';


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
      "Hapus Laporan Game",
      `Apakah Anda yakin ingin menghapus laporan game "${g.id.slice(0, 8)}..."? Berkas game ini akan dihapus permanen dari Supabase Storage.`,
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
      "Hapus Banyak Laporan",
      `Apakah Anda yakin ingin menghapus ${count} laporan game terpilih? Berkas game ini akan dihapus permanen dari Supabase Storage.`,
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
    <div className="space-y-6 animate-fade-in">
      <div className="bezel-outer">
        <div className="bezel-inner p-6 space-y-5">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-lg font-bold font-display flex items-center gap-2 text-zinc-100">
                <FileText className="w-5 h-5 text-rose-500" /> Laporan Game UNO
              </h3>
              <p className="text-xs text-zinc-400">Daftar seluruh pertandingan UNO yang telah didaftarkan ke cloud database.</p>
            </div>

            {selectedGameIds.size > 0 && (
              <button
                onClick={handleDeleteBulk}
                disabled={deleting}
                className="self-start sm:self-center px-4 py-2 text-xs font-bold bg-red-500/10 hover:bg-red-500/25 border border-red-500/30 hover:border-red-500/50 text-red-500 rounded-xl transition-all duration-300 flex items-center gap-2 active:scale-95 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                Hapus Terpilih ({selectedGameIds.size})
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-xs font-bold uppercase tracking-wider">
                  <th className="py-3 px-2 w-10 text-center">
                    {games.length > 0 && (
                      <button
                        type="button"
                        onClick={handleSelectAll}
                        className="text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none"
                      >
                        {isAllSelected ? (
                          <CheckSquare className="w-4.5 h-4.5 text-rose-500" />
                        ) : isSomeSelected ? (
                          <CheckSquare className="w-4.5 h-4.5 text-rose-500/60" />
                        ) : (
                          <Square className="w-4.5 h-4.5" />
                        )}
                      </button>
                    )}
                  </th>
                  <th className="py-3 px-2">Game ID</th>
                  <th className="py-3 px-2">Tanggal Game</th>
                  <th className="py-3 px-2">Jumlah Pemain</th>
                  <th className="py-3 px-2">Babak Ditentukan</th>
                  <th className="py-3 px-2 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {games.map((g) => {
                  const isChecked = selectedGameIds.has(g.id);
                  return (
                    <tr key={g.id} className={`border-b border-zinc-900/60 transition-colors hover:bg-zinc-900/10 ${isChecked ? 'bg-rose-500/5 hover:bg-rose-500/10' : ''}`}>
                      <td className="py-3.5 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleSelectGame(g.id)}
                          className="text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none"
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4.5 h-4.5 text-rose-500" />
                          ) : (
                            <Square className="w-4.5 h-4.5" />
                          )}
                        </button>
                      </td>
                      <td className="py-3.5 px-2 font-mono text-xs text-rose-400 font-semibold">{g.id.slice(0, 8)}...</td>
                      <td className="py-3.5 px-2 text-xs text-zinc-400">
                        {new Date(g.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3.5 px-2 text-xs text-zinc-300 font-semibold">{g.total_players} Pemain</td>
                      <td className="py-3.5 px-2 text-xs text-zinc-400">
                        {g.is_unlimited_rounds ? 'Bebas (Unlimited)' : `${g.total_rounds} Babak`}
                      </td>
                      <td className="py-3.5 px-2 text-right">
                        <div className="inline-flex items-center gap-3">
                          <button
                            onClick={() => onOpenSummaryModal(g)}
                            className="text-xs font-bold text-rose-500 hover:text-rose-400 transition-colors bg-transparent border-0 cursor-pointer"
                          >
                            Buka Ringkasan &rarr;
                          </button>
                          <button
                            onClick={() => handleDeleteSingle(g)}
                            disabled={deleting}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer disabled:opacity-50"
                            title="Hapus laporan ini"
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
                    <td colSpan={6} className="py-8 text-center text-xs text-zinc-500 italic">
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
  );
}
