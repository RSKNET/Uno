"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Shield, ArrowLeft, AlertTriangle, Loader2 } from 'lucide-react';

// design-taste-frontend Configuration:
// DESIGN_VARIANCE: 9
// MOTION_INTENSITY: 5
// VISUAL_DENSITY: 8

export default function AdminLoginPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [systemTime, setSystemTime] = useState("");
  const [isPwa] = useState(() => {
    if (typeof window !== 'undefined') {
      return !!(window.matchMedia('(display-mode: standalone)').matches || (window.navigator as unknown as { standalone?: boolean }).standalone);
    }
    return false;
  });

  useEffect(() => {
    Promise.resolve().then(() => setMounted(true));

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/admin/dashboard');
      } else {
        setCheckingSession(false);
      }
    };
    
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        router.push('/admin/dashboard');
      } else {
        setCheckingSession(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Jakarta',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      };
      const formatter = new Intl.DateTimeFormat('sv-SE', options);
      setSystemTime(formatter.format(now));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/admin`,
        },
      });
      if (error) throw error;
    } catch (err) {
      console.error('Error logging in with Google:', err);
      const message = err instanceof Error ? err.message : 'Gagal masuk dengan Google.';
      setErrorMsg(message);
      setLoading(false);
    }
  };

  if (!mounted) return null;

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0A0C] text-[#E2E8F0] font-mono crt-screen">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-zinc-800 border-t-red-500 animate-spin flex items-center justify-center mx-auto rounded-none" />
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
            [ VERIFYING SESSION PARAMETERS... ]
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0A0A0C] text-[#E2E8F0] font-mono crt-screen relative overflow-x-hidden select-none">
      
      {/* Top Banner / System Telemetry Bar */}
      <header className="w-full border-b border-zinc-800 bg-[#0C0C0E]/90 backdrop-blur-sm px-6 py-3 flex flex-wrap items-center justify-between z-40 text-[11px] tracking-wider text-zinc-500">
        <div className="flex items-center gap-4">
          <span className="text-red-500 font-black tracking-widest uppercase">
            [ UNO_CORE // ADMIN_PORTAL ]
          </span>
        </div>
        <div className="flex items-center gap-4 mt-1 sm:mt-0">
          <span className="uppercase">
            NET_STATUS: {isOnline ? (
              <span className="text-green-500 font-extrabold">[ ONLINE ]</span>
            ) : (
              <span className="text-red-500 font-extrabold">[ OFFLINE ]</span>
            )}
          </span>
          <span className="hidden md:inline text-zinc-600">|</span>
          <span className="text-zinc-400 font-medium">
            {systemTime}
          </span>
        </div>
      </header>

      {/* Main Layout Workspace */}
      <div className="flex-1 w-full flex items-center justify-center p-6 border-t border-zinc-800 relative z-10">
        
        {!isPwa && (
          <button
            onClick={() => router.push('/')}
            className="absolute top-6 left-6 flex items-center gap-1.5 text-[10px] font-black uppercase text-red-500 hover:text-red-400 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            [ ABORT_SECURE_SEQUENCE ]
          </button>
        )}

        <div className="max-w-md w-full border-2 border-zinc-800 bg-[#0C0C0F] relative">
          
          {/* Tactical Grid Crosshairs */}
          <span className="absolute -top-2 -left-2 font-black text-red-500 select-none">+</span >
          <span className="absolute -top-2 -right-2 font-black text-red-500 select-none">+</span >
          <span className="absolute -bottom-3 -left-2 font-black text-red-500 select-none">+</span >
          <span className="absolute -bottom-3 -right-2 font-black text-red-500 select-none">+</span >

          {/* Header Info */}
          <div className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between bg-[#0E0E12]">
            <span className="text-xs font-black uppercase tracking-widest text-[#FFFFFF]">
              [ SECURE ACCESS GATEWAY ]
            </span>
            <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-semibold">
              GATEWAY_ID: G_09
            </span>
          </div>

          <div className="p-6 space-y-6">
            
            <div className="text-center space-y-3">
              <div className="w-12 h-12 border border-zinc-800 flex items-center justify-center text-red-500 mx-auto bg-[#0E0E12]">
                <Shield className="w-6 h-6 animate-pulse" />
              </div>
              <h2 className="text-base font-black uppercase text-[#FFFFFF] tracking-wider">
                [ ADMIN VERIFICATION REQUIRED ]
              </h2>
              <p className="text-[10px] text-zinc-500 uppercase leading-relaxed">
                AUTHORIZED ACCESS ONLY. INITIATE AN IDENTIFICATION LINK TO MANAGE REGISTERED PLAYERS AND CORE SYSTEM VARIABLES.
              </p>
            </div>

            <div className="w-full h-px bg-zinc-800" />

            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-[10px] font-bold uppercase text-center flex items-center justify-center gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {errorMsg}
              </div>
            )}

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-[#121216] border border-zinc-800 hover:border-red-500 hover:bg-zinc-900 disabled:opacity-50 text-white font-black text-xs tracking-wider uppercase transition-colors rounded-none cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white animate-spin rounded-none" />
              ) : (
                <svg className="w-4 h-4 text-[#E2E8F0]" viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>{loading ? '[ AUTHENTICATING... ]' : '[ INITIATE GOOGLE AUTH LINK ]'}</span>
            </button>

            {process.env.NODE_ENV === 'development' && (
              <div className="bg-[#0E0E12] border border-zinc-800 p-3.5 text-[9px] text-zinc-500 text-center leading-relaxed uppercase">
                # LOCAL DEVELOPMENT LOG:<br />
                ENSURE LOCAL GOOGLE AUTH REDIRECT PROVIDER CAPABILITIES ARE FULLY INITIALIZED IN SUPABASE SYSTEM DASHBOARD.
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
