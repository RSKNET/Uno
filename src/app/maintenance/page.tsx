import { Metadata } from 'next';
import { Settings, Wrench, ShieldAlert } from 'lucide-react';

export const metadata: Metadata = {
  title: "Pemeliharaan Sistem | UNO Skors",
  description: "Sistem sedang dalam pemeliharaan rutin. Silakan kembali lagi nanti.",
};

export default function MaintenancePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-zinc-950 text-zinc-100">
      <div className="bezel-outer max-w-md w-full scale-100 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]">
        <div className="bezel-inner p-8 text-center flex flex-col items-center gap-6">
          

          <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 text-red-400">
            <Wrench className="w-8 h-8 animate-pulse" />
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-zinc-900 border border-red-500/30 flex items-center justify-center">
              <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight font-display text-gradient">
              Sistem Dimaintenance
            </h1>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Halo Pemain! Admin sedang melakukan pemeliharaan rutin atau konfigurasi sistem untuk menjaga kestabilan permainan.
            </p>
          </div>

          <div className="w-full h-px bg-zinc-800/60" />

          <div className="flex items-center gap-3 text-xs text-zinc-500 bg-zinc-900/60 px-4 py-2.5 rounded-xl border border-zinc-800/40 w-full justify-center">
            <Settings className="w-4 h-4 animate-spin text-zinc-500" style={{ animationDuration: '6s' }} />
            <span>Halaman ini akan otomatis kembali setelah selesai.</span>
          </div>

        </div>
      </div>
    </div>
  );
}
