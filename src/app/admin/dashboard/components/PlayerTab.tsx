"use client";

import { Users, Plus, Search, Edit, Trash2 } from 'lucide-react';

interface Player {
  id: string;
  name: string;
  created_at: string;
}

interface PlayerTabProps {
  players: Player[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenCreateModal: () => void;
  onOpenEditModal: (player: Player) => void;
  onDeletePlayer: (id: string, name: string) => void;
}

export default function PlayerTab({
  players,
  searchQuery,
  setSearchQuery,
  onOpenCreateModal,
  onOpenEditModal,
  onDeletePlayer
}: PlayerTabProps) {
  const filteredPlayers = players.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
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
              onClick={onOpenCreateModal}
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
                          onClick={() => onOpenEditModal(p)}
                          className="p-1.5 rounded-lg border border-zinc-800 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
                          title="Edit Nama"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeletePlayer(p.id, p.name)}
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
  );
}
