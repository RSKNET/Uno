import Link from 'next/link';
import { ArrowLeft, FileText, Mail } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service - Uno Matrix',
  description: 'Terms of Service for Uno Matrix card game score companion application.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0C] text-[#E2E8F0] py-8 px-4 sm:px-8 lg:px-12 relative overflow-x-hidden font-mono crt-screen">
      
      <div className="w-full max-w-[1600px] mx-auto space-y-6 relative z-10">
        
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-red-500 hover:text-red-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          [ RETURN TO HOME ]
        </Link>

        {/* Header Block */}
        <div className="space-y-4 border border-zinc-800 bg-[#0C0C0F] p-6 relative">
          <span className="absolute -top-2 -left-2 font-black text-red-500 select-none">+</span >
          <span className="absolute -top-2 -right-2 font-black text-red-500 select-none">+</span >
          <span className="absolute -bottom-3 -left-2 font-black text-red-500 select-none">+</span >
          <span className="absolute -bottom-3 -right-2 font-black text-red-500 select-none">+</span >

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border border-zinc-800 bg-[#121216] flex items-center justify-center text-red-500">
              <FileText className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h1 className="text-lg font-black uppercase tracking-wider text-white">
                Terms of Service // Uno Matrix
              </h1>
              <p className="text-[11px] text-zinc-500 uppercase tracking-widest">
                Effective Date: September 27, 2026
              </p>
            </div>
          </div>
        </div>

        <div className="w-full h-px bg-zinc-800" />

        {/* Terms Body in 2-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-zinc-300 text-xs leading-relaxed font-sans">
          
          <section className="space-y-3 border border-zinc-800/80 bg-[#0C0C0F]/80 p-5">
            <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing and using Uno Matrix (&ldquo;the application&rdquo;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the application.
            </p>
          </section>

          <section className="space-y-3 border border-zinc-800/80 bg-[#0C0C0F]/80 p-5">
            <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
              2. Description of Service
            </h2>
            <p>
              Uno Matrix is an online companion tool designed to help players track rounds, calculate points, manage player statistics, and view match summaries for Uno card games. The service is provided free of charge for recreational use.
            </p>
          </section>

          <section className="space-y-3 border border-zinc-800/80 bg-[#0C0C0F]/80 p-5">
            <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
              3. User Responsibilities &amp; Conduct
            </h2>
            <p>
              When utilizing Uno Matrix, users agree not to:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-zinc-400">
              <li>Attempt to reverse-engineer, compromise, or disrupt the backend infrastructure or databases.</li>
              <li>Exploit authentication flows or impersonate other users or administrators.</li>
              <li>Input abusive, unlawful, or harmful player names or game content.</li>
            </ul>
          </section>

          <section className="space-y-3 border border-zinc-800/80 bg-[#0C0C0F]/80 p-5 flex flex-col justify-between">
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
                4. Disclaimer of Warranties
              </h2>
              <p>
                Uno Matrix is provided on an &ldquo;AS IS&rdquo; and &ldquo;AS AVAILABLE&rdquo; basis without warranties of any kind, whether express or implied. We do not guarantee that the service will be uninterrupted, error-free, or that historical match records will never be lost.
              </p>
            </div>
          </section>

          <section className="space-y-3 border border-zinc-800/80 bg-[#0C0C0F]/80 p-5 md:col-span-2">
            <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wide flex items-center gap-2">
              <Mail className="w-4 h-4 text-red-500" />
              5. Contact Us
            </h2>
            <p>
              For any questions or support regarding these Terms of Service, please contact:
            </p>
            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded font-mono text-xs">
              <p className="text-zinc-400">Application: <span className="text-white">Uno Matrix</span></p>
              <p className="text-zinc-400">Support Email: <a href="mailto:riskicahyadi.2nd@gmail.com" className="text-red-400 hover:text-red-300 underline">riskicahyadi.2nd@gmail.com</a></p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

