import Link from 'next/link';
import { HelpCircle, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: '404 - Halaman Tidak Ditemukan',
  description: 'Halaman yang Anda cari tidak tersedia di UNO Skors.',
};

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-[#0A0A0C] text-[#E2E8F0] font-mono crt-screen select-none">
      
      {/* Central 404 Box */}
      <div className="max-w-md w-full border-2 border-zinc-800 bg-[#0C0C0F] p-6 relative rounded-none">
        
        {/* Tactical Grid Crosshairs */}
        <span className="absolute -top-2 -left-2 font-black text-red-500 select-none">+</span >
        <span className="absolute -top-2 -right-2 font-black text-red-500 select-none">+</span >
        <span className="absolute -bottom-3 -left-2 font-black text-red-500 select-none">+</span >
        <span className="absolute -bottom-3 -right-2 font-black text-red-500 select-none">+</span >

        <div className="text-center flex flex-col items-center gap-6">
          
          <div className="w-12 h-12 border border-zinc-800 bg-[#121216] flex items-center justify-center text-red-500 rounded-none">
            <HelpCircle className="w-6 h-6 animate-pulse" />
          </div>

          <div className="space-y-3 font-mono">
            <h2 className="text-3xl font-black tracking-widest text-red-500 uppercase">
              [ 404_ADDR_FAULT ]
            </h2>
            <h3 className="text-xs font-black uppercase text-zinc-300">
              ROUTE SEGMENT NOT INITIALIZED
            </h3>
            <p className="text-[10px] text-zinc-500 uppercase leading-relaxed">
              THE REQUESTED ROUTE PATHWAY IS INVALID OR HAS BEEN EXPUNGED FROM THE CORE UNO SYSTEM MEMORY MAP.
            </p>
          </div>

          <div className="w-full h-px bg-zinc-800" />

          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 bg-[#121216] border border-zinc-800 hover:border-red-500 hover:bg-zinc-900 text-zinc-300 font-black py-3 text-xs tracking-widest uppercase transition-colors rounded-none cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            [ ABORT SEQUENCE AND RESET ]
          </Link>
        </div>
      </div>
    </div>
  );
}
