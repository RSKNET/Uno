import Link from 'next/link';
import { HelpCircle, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: '404 - Halaman Tidak Ditemukan',
  description: 'Halaman yang Anda cari tidak tersedia di UNO Skors.',
};

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-zinc-950 text-zinc-100 relative overflow-x-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-rose-500/5 blur-[120px] pointer-events-none" />

      <div className="bezel-outer max-w-sm w-full relative z-10">
        <div className="bezel-inner p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mx-auto">
              <HelpCircle className="w-6 h-6 animate-bounce" />
            </div>
            <h2 className="text-4xl font-black font-display text-gradient">404</h2>
            <h3 className="text-sm font-bold text-zinc-200">Halaman Tidak Ditemukan</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Halaman yang Anda cari tidak tersedia, telah dihapus, atau dipindahkan.
            </p>
          </div>

          <div className="w-full h-px bg-zinc-800/80" />

          <Link
            href="/"
            className="w-full flex items-center justify-center gap-1.5 px-4 py-3 bg-zinc-900 hover:bg-zinc-800/80 text-white rounded-xl border border-zinc-800 hover:border-zinc-700 text-xs font-bold transition-all active:scale-[0.98]"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
