import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service - UNO Skors',
  description: 'Syarat dan Ketentuan penggunaan aplikasi pencatat skor UNO Skors.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0C] text-[#E2E8F0] py-16 px-6 relative overflow-x-hidden font-mono crt-screen select-none">
      
      <div className="max-w-2xl mx-auto space-y-8 relative z-10">
        
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase text-red-500 hover:text-red-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          [ ABORT PROTOCOL // RETURN TO CORE ]
        </Link>

        {/* Header Block */}
        <div className="space-y-4 border border-zinc-800 bg-[#0C0C0F] p-6 relative">
          <span className="absolute -top-2 -left-2 font-black text-red-500 select-none">+</span >
          <span className="absolute -top-2 -right-2 font-black text-red-500 select-none">+</span >
          <span className="absolute -bottom-3 -left-2 font-black text-red-500 select-none">+</span >
          <span className="absolute -bottom-3 -right-2 font-black text-red-500 select-none">+</span >

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border border-zinc-800 bg-[#121216] flex items-center justify-center text-red-500 rounded-none">
              <FileText className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h1 className="text-base font-black uppercase tracking-widest text-white">
                [ TERMS OF SERVICE MATRIX ]
              </h1>
              <p className="text-[9px] text-zinc-500 uppercase">
                LAST UPDATE PARAMETER: 07 JUL 2026
              </p>
            </div>
          </div>
        </div>

        <div className="w-full h-px bg-zinc-800" />

        {/* Content details */}
        <div className="space-y-8 text-zinc-400 text-xs leading-relaxed uppercase">
          
          <section className="space-y-2 border border-zinc-800/60 bg-[#0C0C0F]/45 p-5">
            <h2 className="text-xs font-black text-white">
              [ 01 // TERM_ACCEPTANCE ]
            </h2>
            <p className="text-[11px]">
              BY INITIATING AND OPERATING THE UNO SYSTEM INTERFACES, YOU AGREE TO REMAIN STRICTLY BOUND BY THESE SERVICE TERMS. IF DEVIATING OR NOT CONCURRING, IMMEDIATELY DISCONTINUE ALL ACCESS INSTRUCTIONS.
            </p>
          </section>

          <section className="space-y-2 border border-zinc-800/60 bg-[#0C0C0F]/45 p-5">
            <h2 className="text-xs font-black text-white">
              [ 02 // USAGE_PROTOCOL ]
            </h2>
            <p className="text-[11px]">
              THIS SYSTEM INTERFACE IS DISTRIBUTED EXCLUSIVELY FOR CONVENIENT MATCH CALCULATION PURPOSES. USERS ARE FORBIDDEN FROM:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-[10px] text-zinc-500">
              <li>INITIATING PENETRATION DEVIATIONS OR REVERSE ENGINEERING CORE DATABASE CHANNELS.</li>
              <li>ABUSING AUTHENTICATED ACCESS TO MANIPULATE PRIVATE API PARAMETERS OR SECURE SYSTEM STATES.</li>
            </ul>
          </section>

          <section className="space-y-2 border border-zinc-800/60 bg-[#0C0C0F]/45 p-5">
            <h2 className="text-xs font-black text-white">
              [ 03 // ADMIN_ROLES ]
            </h2>
            <p className="text-[11px]">
              SECURE ADMIN GATEWAYS ARE CONTROLLED VIA REGISTERED IDENTITIES (GOOGLE OAUTH). ADMINISTRATORS RETAIN ABSOLUTE OWNERSHIP FOR LOG FILE INTEGRITY, DATA READOUT ACTIONS, AND CONTROL DEPLOYMENTS.
            </p>
          </section>

          <section className="space-y-2 border border-zinc-800/60 bg-[#0C0C0F]/45 p-5">
            <h2 className="text-xs font-black text-white">
              [ 04 // WARRENTY_LIMITATIONS ]
            </h2>
            <p className="text-[11px]">
              THE UNO SYSTEM RUNTIME IS DISTRIBUTED &quot;AS IS&quot; WITHOUT ANY EXPLICIT WARRANTIES. WE ASSUME ZERO RESPONSIBILITY FOR HISTORICAL DATABASE LOG ERASURES OR BROWSER STORAGE FAULTS.
            </p>
          </section>

          <section className="space-y-2 border border-zinc-800/60 bg-[#0C0C0F]/45 p-5">
            <h2 className="text-xs font-black text-white">
              [ 05 // SYSTEM_AMENDMENTS ]
            </h2>
            <p className="text-[11px]">
              THE ADMINISTRATOR RESERVES THE RIGHT TO AMEND SYSTEM RULES AT ANY TIME WITHOUT PRE-FLIGHT NOTICE. LOG UPDATES BECOME IMMEDIATELY ENFORCED UPON REFLECTION ON THE LIVE APP DOM.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
