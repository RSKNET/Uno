"use client";

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft } from 'lucide-react';

function ErrorDetails() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const error = searchParams.get('error') || 'unexpected_failure';
  const errorDescription = searchParams.get('error_description') || 'Terjadi kesalahan sistem yang tidak terduga.';

  return (
    <div className="bezel-outer max-w-sm w-full relative z-10">
      <div className="bezel-inner p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mx-auto">
            <AlertCircle className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-xl font-bold font-display text-red-500">Terjadi Kesalahan</h2>
          <p className="text-xs text-zinc-400">Gagal memproses permintaan autentikasi Anda.</p>
        </div>

        <div className="w-full h-px bg-zinc-800/80" />

        <div className="p-3.5 bg-red-500/5 border border-red-500/10 rounded-xl space-y-1">
          <p className="text-[10px] uppercase font-bold text-red-400 tracking-wider">Kode: {error}</p>
          <p className="text-xs text-zinc-300 leading-relaxed">{errorDescription}</p>
        </div>

        <button
          onClick={() => router.push('/admin')}
          className="w-full flex items-center justify-center gap-1.5 px-4 py-3 bg-zinc-900 hover:bg-zinc-800/80 text-white rounded-xl border border-zinc-800 hover:border-zinc-700 text-xs font-bold transition-all active:scale-[0.98]"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Login Admin
        </button>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-zinc-950 text-zinc-100 relative overflow-x-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-red-500/5 blur-[120px] pointer-events-none" />
      <Suspense fallback={
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 mx-auto animate-spin" />
          <p className="text-xs text-zinc-500">Memuat detail kesalahan...</p>
        </div>
      }>
        <ErrorDetails />
      </Suspense>
    </div>
  );
}
