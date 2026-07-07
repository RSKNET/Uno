import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service - UNO Skors',
  description: 'Syarat dan Ketentuan penggunaan aplikasi pencatat skor UNO Skors.',
};

export default function TermsPage() {
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
            <FileText className="w-5 h-5" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight font-display text-gradient">Syarat & Ketentuan</h1>
          <p className="text-xs text-zinc-500">Terakhir diperbarui: 7 Juli 2026</p>
        </div>

        <div className="w-full h-px bg-zinc-800/80" />

        <div className="space-y-6 text-zinc-400 text-sm leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-zinc-200">1. Penerimaan Syarat</h2>
            <p>
              Dengan mengakses dan menggunakan aplikasi UNO Skors, Anda dianggap telah membaca, memahami, dan menyetujui untuk terikat oleh Syarat dan Ketentuan ini. Jika Anda tidak menyetujui bagian mana pun, harap segera hentikan penggunaan aplikasi ini.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-zinc-200">2. Penggunaan Layanan</h2>
            <p>
              Aplikasi ini disediakan khusus untuk membantu pencatatan skor game kartu UNO secara lokal dan personal. Anda dilarang keras untuk:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Menggunakan aplikasi untuk tujuan ilegal atau melanggar hukum.</li>
              <li>Mencoba mengeksploitasi celah keamanan database, memanipulasi API, atau meretas hak akses administrator.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-zinc-200">3. Akun Administrator</h2>
            <p>
              Akses ke Portal Admin dilindungi dan hanya diizinkan untuk email administrator yang terdaftar (Google OAuth). Admin bertanggung jawab penuh untuk menjaga integritas data pemain, laporan game, dan konfigurasi sistem.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-zinc-200">4. Batasan Tanggung Jawab</h2>
            <p>
              Aplikasi ini disediakan &quot;apa adanya&quot; (as is) tanpa jaminan apa pun. Kami tidak bertanggung jawab atas hilangnya data riwayat permainan karena kendala lokal browser atau pemeliharaan server database.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-zinc-200">5. Perubahan Ketentuan</h2>
            <p>
              Kami dapat memperbarui Syarat dan Ketentuan ini sewaktu-waktu tanpa pemberitahuan sebelumnya. Perubahan akan langsung berlaku setelah dipublikasikan pada halaman ini.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
