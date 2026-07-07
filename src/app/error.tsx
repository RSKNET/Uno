"use client";

import { useEffect } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled system error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-zinc-950 text-zinc-100 relative overflow-x-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-red-500/5 blur-[120px] pointer-events-none" />

      <div className="bezel-outer max-w-sm w-full relative z-10">
        <div className="bezel-inner p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mx-auto">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <h2 className="text-xl font-bold font-display text-red-500">Kesalahan Sistem</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Terjadi gangguan teknis saat memuat halaman ini.
            </p>
          </div>

          <div className="w-full h-px bg-zinc-800/80" />

          {error.digest && (
            <div className="p-2.5 bg-zinc-900 border border-zinc-800/60 rounded-xl text-center">
              <p className="text-[9px] font-mono text-zinc-500">ID Error: {error.digest}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => reset()}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800/80 text-white rounded-xl border border-zinc-800 hover:border-zinc-700 text-xs font-bold transition-all active:scale-[0.98]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Coba Lagi
            </button>
            <Link
              href="/"
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all active:scale-[0.98] shadow-md shadow-rose-600/10"
            >
              <Home className="w-3.5 h-3.5" />
              Beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
