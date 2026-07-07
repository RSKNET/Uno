import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy - UNO Skors',
  description: 'Kebijakan Privasi aplikasi pencatat skor UNO Skors.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 py-16 px-6 relative overflow-x-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-rose-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-2xl mx-auto space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Aplikasi
        </Link>

        <div className="space-y-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
            <Shield className="w-5 h-5" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight font-display text-gradient">Kebijakan Privasi</h1>
          <p className="text-xs text-zinc-500">Terakhir diperbarui: 7 Juli 2026</p>
        </div>

        <div className="w-full h-px bg-zinc-800/80" />

        <div className="space-y-6 text-zinc-400 text-sm leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-zinc-200">1. Informasi yang Kami Kumpulkan</h2>
            <p>
              Kami mengumpulkan informasi minimal untuk menunjang fungsionalitas aplikasi UNO Skors:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Data Autentikasi Admin:</strong> Jika Anda masuk sebagai administrator via Google OAuth, kami menyimpan email, nama, dan foto profil Anda untuk memverifikasi hak akses.</li>
              <li><strong>Data Permainan:</strong> Nama pemain dan riwayat skor disimpan di database lokal/cloud untuk keperluan pencatatan skor game.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-zinc-200">2. Penggunaan Informasi</h2>
            <p>
              Informasi yang dikumpulkan hanya digunakan untuk:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Mengizinkan akses admin untuk mengelola daftar pemain dan pengaturan sistem.</li>
              <li>Menampilkan riwayat pertandingan dan laporan game UNO secara akurat.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-zinc-200">3. Keamanan Data</h2>
            <p>
              Kami berkomitmen untuk menjaga keamanan data Anda. Kami menggunakan enkripsi standar industri dan pengamanan database via Row Level Security (RLS) di Supabase guna memastikan data Anda terlindungi dari akses tidak sah.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-zinc-200">4. Layanan Pihak Ketiga</h2>
            <p>
              Aplikasi kami menggunakan layanan Google OAuth untuk proses masuk admin dan Supabase Cloud untuk penyimpanan database. Kebijakan privasi masing-masing penyedia berlaku untuk data yang diproses oleh sistem mereka.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-zinc-200">5. Hubungi Kami</h2>
            <p>
              Jika Anda memiliki pertanyaan mengenai kebijakan privasi ini, silakan hubungi administrator sistem melalui email di <code className="text-rose-400">riskicahyadi.2nd@gmail.com</code>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
