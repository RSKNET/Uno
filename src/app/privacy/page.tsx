import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy - UNO Skors',
  description: 'Kebijakan Privasi aplikasi pencatat skor UNO Skors.',
};

export default function PrivacyPage() {
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
              <Shield className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h1 className="text-base font-black uppercase tracking-widest text-white">
                [ PRIVACY POLICY MATRIX ]
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
              [ 01 // INFORMATION_COLLECTION ]
            </h2>
            <p className="text-[11px]">
              WE COLLECT MINIMAL INFORMATION SPECIFICATIONS REQUIRED TO RUN THE SCORING RUNTIME ENVIRONMENT:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-[10px] text-zinc-500">
              <li><strong>ADMIN AUTHENTICATION:</strong> INGESTS EMAIL, NAME, AND AVATAR DATA PARAMETERS SECURELY VIA GOOGLE OAUTH FOR VALIDATING ACCESS ROLES.</li>
              <li><strong>MATCH DATA CONTROLS:</strong> CACHES PLAYER ALIASES AND HISTORICAL SCORES LOCALLY AND SYNCS TO SUPABASE CLOUD FOR METRIC ACCUMULATION.</li>
            </ul>
          </section>

          <section className="space-y-2 border border-zinc-800/60 bg-[#0C0C0F]/45 p-5">
            <h2 className="text-xs font-black text-white">
              [ 02 // LOGISTICS_USAGE ]
            </h2>
            <p className="text-[11px]">
              COLLECTED VARIABLES ARE SOLELY ALLOCATED TO:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-[10px] text-zinc-500">
              <li>GRANT ADMIN ROLES AND PROCESS SYSTEM CONSTANTS MODIFICATIONS.</li>
              <li>COMPILE STATISTICAL LEADERBOARDS AND OUTPUT EXPORTABLE PDF REPORTS.</li>
            </ul>
          </section>

          <section className="space-y-2 border border-zinc-800/60 bg-[#0C0C0F]/45 p-5">
            <h2 className="text-xs font-black text-white">
              [ 03 // SECURITY_STANDARD ]
            </h2>
            <p className="text-[11px]">
              WE COMMIT TO PROTECTING COLLECTED SYSTEM PARAMS. SECURE INDUSTRY-STANDARD ENCRYPTED PROTOCOLS AND SUPABASE ROW LEVEL SECURITY (RLS) POLICIES ARE ENFORCED TO SHIELD METRICS FROM UNAUTHORIZED INDEX READS.
            </p>
          </section>

          <section className="space-y-2 border border-zinc-800/60 bg-[#0C0C0F]/45 p-5">
            <h2 className="text-xs font-black text-white">
              [ 04 // EXTERNAL_PROVIDERS ]
            </h2>
            <p className="text-[11px]">
              THE UNO MATRIX RELIES ON GOOGLE OAUTH LOGINS AND SUPABASE CLOUD DATABASES. THE PRIVACY GUIDELINES OUTLINED BY THE RESPECTIVE VENDORS DICTATE PROCESSING LOGS UNDER THEIR DIRECT RUNTIMES.
            </p>
          </section>

          <section className="space-y-2 border border-zinc-800/60 bg-[#0C0C0F]/45 p-5">
            <h2 className="text-xs font-black text-white">
              [ 05 // SYSTEM_COMMUNICATION ]
            </h2>
            <p className="text-[11px]">
              FOR QUERIES CONCERNING THESE TERMS, DISPATCH SYSTEM COMMS VIA E-MAIL AT: <code className="text-red-500 font-bold">RISKICAHYADI.2ND@GMAIL.COM</code>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
