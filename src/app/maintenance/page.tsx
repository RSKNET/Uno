import { Metadata } from 'next';
import { Wrench, ShieldAlert } from 'lucide-react';

export const metadata: Metadata = {
  title: "Pemeliharaan Sistem | UNO Skors",
  description: "Sistem sedang dalam pemeliharaan rutin. Silakan kembali lagi nanti.",
};

export default function MaintenancePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-[#0A0A0C] text-[#E2E8F0] font-mono crt-screen select-none">
      
      {/* Central Alert Box */}
      <div className="max-w-md w-full border-2 border-red-500 bg-[#0C0C0F] p-6 relative rounded-none">
        
        {/* Tactical Grid Crosshairs */}
        <span className="absolute -top-2 -left-2 font-black text-red-500 select-none">+</span >
        <span className="absolute -top-2 -right-2 font-black text-red-500 select-none">+</span >
        <span className="absolute -bottom-3 -left-2 font-black text-red-500 select-none">+</span >
        <span className="absolute -bottom-3 -right-2 font-black text-red-500 select-none">+</span >

        <div className="text-center flex flex-col items-center gap-6">
          
          <div className="relative flex items-center justify-center w-16 h-16 bg-red-600/10 border border-red-500/30 text-red-500 rounded-none">
            <Wrench className="w-8 h-8 animate-pulse" />
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#0C0C0F] border border-red-500 flex items-center justify-center rounded-none">
              <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
            </div>
          </div>

          <div className="space-y-3 font-mono">
            <h1 className="text-base font-black uppercase tracking-widest text-[#FFFFFF]">
              [ SYSTEM STATUS // MAINTENANCE ]
            </h1>
            <p className="text-[10px] text-zinc-500 leading-relaxed uppercase">
              THE MATRIX ADMINISTRATOR HAS INITIATED A SECURE MAINTENANCE SEQUENCE. PUBLIC INTERFACES ARE TEMPORARILY DEACTIVATED TO SAFEGUARD MATCH STATISTICS DATABASE INTEGRITY.
            </p>
          </div>

          <div className="w-full h-px bg-red-500/20" />

          <div className="flex items-center gap-3 text-[10px] text-red-500 bg-[#1A0C0C] px-4 py-2.5 border border-red-500/30 w-full justify-center rounded-none font-bold uppercase tracking-wider">
            <span>[ SYSTEM WILL AUTO-ONLINE ON COMPLETE ]</span>
          </div>

        </div>
      </div>
    </div>
  );
}
