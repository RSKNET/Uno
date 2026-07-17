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
    <div className="max-w-md w-full border-2 border-red-500 bg-[#0C0C0F] p-6 relative rounded-none font-mono">
      
      {/* Tactical Grid Crosshairs */}
      <span className="absolute -top-2 -left-2 font-black text-red-500 select-none">+</span >
      <span className="absolute -top-2 -right-2 font-black text-red-500 select-none">+</span >
      <span className="absolute -bottom-3 -left-2 font-black text-red-500 select-none">+</span >
      <span className="absolute -bottom-3 -right-2 font-black text-red-500 select-none">+</span >

      <div className="text-center flex flex-col items-center gap-6">
        
        <div className="w-12 h-12 border border-red-500 bg-[#1A0C0C] flex items-center justify-center text-red-500 rounded-none">
          <AlertCircle className="w-6 h-6 animate-pulse" />
        </div>

        <div className="space-y-3 font-mono">
          <h2 className="text-base font-black tracking-widest text-red-500 uppercase">
            [ AUTHENTICATION_EXCEPTION ]
          </h2>
          <p className="text-[10px] text-zinc-500 uppercase leading-relaxed">
            THE AUTH SYSTEM REJECTED THE REDIRECT SEQUENCE REQUEST. PROCESS TERMINATED.
          </p>
        </div>

        <div className="w-full h-px bg-red-500/20" />

        <div className="p-3.5 bg-[#121216] border border-zinc-800 space-y-1.5 w-full text-left rounded-none">
          <p className="text-[9px] uppercase font-black text-red-500 tracking-wider">FAULT_CODE: {error.toUpperCase()}</p>
          <p className="text-[10px] text-zinc-400 leading-normal uppercase">{errorDescription}</p>
        </div>

        <button
          onClick={() => router.push('/admin')}
          className="w-full flex items-center justify-center gap-2 bg-[#121216] border border-zinc-800 hover:border-red-500 hover:bg-zinc-900 text-zinc-300 font-black py-3 text-xs tracking-widest uppercase transition-colors rounded-none cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          [ RETURN TO ADMIN GATEWAY ]
        </button>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-[#0A0A0C] text-[#E2E8F0] font-mono crt-screen select-none">
      <Suspense fallback={
        <div className="text-center space-y-3">
          <div className="h-6 w-6 border-2 border-zinc-800 border-t-red-500 animate-spin rounded-none mx-auto"></div>
          <p className="text-[10px] uppercase font-bold tracking-widest opacity-60">[ COMPILING AUTH FAULTS... ]</p>
        </div>
      }>
        <ErrorDetails />
      </Suspense>
    </div>
  );
}
