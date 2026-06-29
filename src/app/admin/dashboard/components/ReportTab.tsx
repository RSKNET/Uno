"use client";

import { FileText } from 'lucide-react';

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
}

export default function ReportTab({ games, onOpenSummaryModal }: ReportTabProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bezel-outer">
        <div className="bezel-inner p-6 space-y-5">
          
          <div className="space-y-1">
            <h3 className="text-lg font-bold font-display flex items-center gap-2">
              <FileText className="w-5 h-5 text-rose-500" /> Laporan Game UNO
            </h3>
            <p className="text-xs text-zinc-400">Daftar seluruh pertandingan UNO yang telah didaftarkan ke cloud database.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-xs font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-2">Game ID</th>
                  <th className="py-2.5 px-2">Tanggal Game</th>
                  <th className="py-2.5 px-2">Jumlah Pemain</th>
                  <th className="py-2.5 px-2">Babak Ditentukan</th>
                  <th className="py-2.5 px-2 text-right">Tautan Ringkasan</th>
                </tr>
              </thead>
              <tbody>
                {games.map((g) => (
                  <tr key={g.id} className="border-b border-zinc-900/60 hover:bg-zinc-900/20 transition-colors">
                    <td className="py-3.5 px-2 font-mono text-xs text-rose-400 font-semibold">{g.id.slice(0, 8)}...</td>
                    <td className="py-3.5 px-2 text-xs text-zinc-400">
                      {new Date(g.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-2 text-xs text-zinc-300 font-semibold">{g.total_players} Pemain</td>
                    <td className="py-3.5 px-2 text-xs text-zinc-400">
                      {g.is_unlimited_rounds ? 'Bebas (Unlimited)' : `${g.total_rounds} Babak`}
                    </td>
                    <td className="py-3.5 px-2 text-right">
                      <button
                        onClick={() => onOpenSummaryModal(g)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-rose-500 hover:text-rose-400 transition-colors bg-transparent border-0 cursor-pointer"
                      >
                        Buka Ringkasan &rarr;
                      </button>
                    </td>
                  </tr>
                ))}
                {games.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-zinc-500 italic">
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
