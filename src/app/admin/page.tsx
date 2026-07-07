"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Shield, ArrowLeft } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
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
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-100">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mx-auto">
            <Shield className="w-6 h-6 animate-pulse" />
          </div>
          <p className="text-xs text-zinc-400 animate-pulse">Memeriksa sesi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-zinc-950 text-zinc-100 relative overflow-x-hidden">
      

      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-rose-500/5 blur-[120px] pointer-events-none" />


      {!isPwa && (
        <button
          onClick={() => router.push('/')}
          className="absolute top-6 left-6 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to App
        </button>
      )}

      <div className="bezel-outer max-w-sm w-full relative z-10">
        <div className="bezel-inner p-6 sm:p-8 space-y-6">
          
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mx-auto">
              <Shield className="w-6 h-6 animate-pulse" />
            </div>
            <h2 className="text-xl font-bold font-display text-gradient">Portal Admin</h2>
            <p className="text-xs text-zinc-400">Masuk untuk mengelola pemain dan pengaturan sistem.</p>
          </div>

          <div className="w-full h-px bg-zinc-800/80" />


          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-xl text-center">
              {errorMsg}
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-zinc-900 hover:bg-zinc-800/80 disabled:opacity-50 text-white rounded-xl border border-zinc-800 hover:border-zinc-700 font-medium transition-all shadow-lg active:scale-[0.98]"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  fill="#EA4335"
                />
              </svg>
            )}
            <span>{loading ? 'Menghubungkan...' : 'Masuk dengan Google'}</span>
          </button>


          {process.env.NODE_ENV === 'development' && (
            <div className="bg-zinc-900/50 border border-zinc-800/40 p-3 rounded-xl text-[10px] text-zinc-500 text-center leading-relaxed">
              Pastikan Anda telah mengonfigurasi Google Auth di Supabase lokal untuk dapat login.
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
