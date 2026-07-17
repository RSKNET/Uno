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
    <div className="space-y-6 select-none font-mono animate-fade-in text-[#E2E8F0] w-full">
      <div className="border border-zinc-800 bg-[#0C0C0F] p-6 space-y-5 rounded-none relative">
        <span className="absolute -top-2 -left-2 font-black text-red-500 select-none">+</span >
        <span className="absolute -top-2 -right-2 font-black text-red-500 select-none">+</span >
        <span className="absolute -bottom-3 -left-2 font-black text-red-500 select-none">+</span >
        <span className="absolute -bottom-3 -right-2 font-black text-red-500 select-none">+</span >

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-black uppercase text-[#FFFFFF] tracking-wider flex items-center gap-2">
              <Users className="w-5 h-5 text-red-500" /> [ PLAYER REGISTRY DATABASE ]
            </h3>
            <p className="text-[10px] text-zinc-500 uppercase leading-relaxed">
              REGISTER, UPDATE, AND AUDIT IDENTITIES SAVED ON THE CLOUD DATABASE.
            </p>
          </div>

          <button
            onClick={onOpenCreateModal}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs tracking-wider transition-colors border-b-4 border-red-800 active:border-b-0 active:translate-y-0.5 rounded-none flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            [ + NEW_PLAYER_ENTRY ]
          </button>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="SEARCH PLAYER IDENTITY..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#121216] border border-zinc-800 pl-10 pr-4 py-2.5 text-xs font-bold focus:outline-none focus:border-red-500 text-[#E2E8F0] rounded-none uppercase"
          />
        </div>

        {/* Database table list */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 text-[10px] font-black uppercase tracking-wider">
                <th className="py-2.5 px-2">PLAYER_NAME</th>
                <th className="py-2.5 px-2">REGISTRATION_DATE</th>
                <th className="py-2.5 px-2 text-right">OPERATIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlayers.map((p) => (
                <tr key={p.id} className="border-b border-zinc-900 hover:bg-[#121216] transition-colors font-medium">
                  <td className="py-3.5 px-2 font-bold uppercase text-zinc-300">{p.name}</td>
                  <td className="py-3.5 px-2 text-[10px] text-zinc-500 uppercase">
                    {new Date(p.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' }).toUpperCase()}
                  </td>
                  <td className="py-3.5 px-2 text-right">
                    <div className="inline-flex gap-2">
                      <button
                        onClick={() => onOpenEditModal(p)}
                        className="p-1.5 border border-zinc-800 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 transition-colors rounded-none cursor-pointer"
                        title="EDIT NAME"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeletePlayer(p.id, p.name)}
                        className="p-1.5 border border-zinc-800 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 transition-colors rounded-none cursor-pointer"
                        title="DELETE ENTRY"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPlayers.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-[10px] text-zinc-500 italic uppercase">
                    [ NO PLAYER MATCHES REGISTERED IN DATABASE ]
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
