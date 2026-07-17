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
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-[#0A0A0C] text-[#E2E8F0] font-mono crt-screen select-none">
      
      {/* Central Error Box */}
      <div className="max-w-md w-full border-2 border-red-500 bg-[#0C0C0F] p-6 relative rounded-none">
        
        {/* Tactical Grid Crosshairs */}
        <span className="absolute -top-2 -left-2 font-black text-red-500 select-none">+</span >
        <span className="absolute -top-2 -right-2 font-black text-red-500 select-none">+</span >
        <span className="absolute -bottom-3 -left-2 font-black text-red-500 select-none">+</span >
        <span className="absolute -bottom-3 -right-2 font-black text-red-500 select-none">+</span >

        <div className="text-center flex flex-col items-center gap-6">
          
          <div className="w-12 h-12 border border-red-500 bg-[#1A0C0C] flex items-center justify-center text-red-500 rounded-none">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>

          <div className="space-y-3 font-mono">
            <h2 className="text-base font-black tracking-widest text-red-500 uppercase">
              [ SYSTEM_EXCEPTION_FAULT ]
            </h2>
            <p className="text-[10px] text-zinc-500 uppercase leading-relaxed">
              UNHANDLED RUNTIME FAILURE OCCURRED WITHIN PROCESS LOOP. CORE COMPONENT STACKS DEVIATED FROM PROTOCOL.
            </p>
          </div>

          <div className="w-full h-px bg-red-500/20" />

          {error.digest && (
            <div className="p-3 bg-[#121216] border border-zinc-800 text-center w-full rounded-none">
              <p className="text-[9px] font-mono text-zinc-500 uppercase">FAULT_HASH: {error.digest.toUpperCase()}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 w-full font-bold">
            <button
              onClick={() => reset()}
              className="flex-1 flex items-center justify-center gap-2 bg-[#121216] border border-zinc-800 hover:border-red-500 hover:bg-zinc-900 text-zinc-300 py-3 text-xs tracking-wider uppercase transition-colors rounded-none cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 shrink-0" />
              [ RE-REBOOT ]
            </button>
            <Link
              href="/"
              className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3 text-xs tracking-wider uppercase transition-colors border-b-2 border-red-800 active:border-b-0 active:translate-y-0.5 rounded-none cursor-pointer"
            >
              <Home className="w-3.5 h-3.5 shrink-0" />
              [ MAIN CORE ]
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
