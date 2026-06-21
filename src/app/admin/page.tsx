"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/lib/supabase';
import { Shield, ArrowLeft } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/admin/dashboard');
      }
    };
    
    checkSession();


    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        router.push('/admin/dashboard');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-zinc-950 text-zinc-100 relative">
      

      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-rose-500/5 blur-[120px] pointer-events-none" />


      <button
        onClick={() => router.push('/')}
        className="absolute top-6 left-6 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to App
      </button>

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


          <div className="supabase-auth-container">
            <Auth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: '#f43f5e',
                      brandAccent: '#e11d48',
                      inputBackground: 'rgba(255, 255, 255, 0.02)',
                      inputBorder: 'rgba(255, 255, 255, 0.08)',
                      inputText: '#fafafa',
                      inputPlaceholder: '#71717a',
                      inputBorderFocus: '#f43f5e',
                    },
                    radii: {
                      borderRadiusButton: '12px',
                      inputBorderRadius: '12px',
                    }
                  },
                },
              }}
              theme="dark"
              providers={[]}
              localization={{
                variables: {
                  sign_in: {
                    email_label: 'Alamat Email',
                    password_label: 'Kata Sandi',
                    button_label: 'Masuk Sekarang',
                    loading_button_label: 'Sedang memproses masuk...',
                  },
                },
              }}
            />
          </div>


          <div className="bg-zinc-900/50 border border-zinc-800/40 p-3 rounded-xl text-[10px] text-zinc-500 text-center leading-relaxed">
            <span className="font-bold text-zinc-400">Kredensial Pengujian:</span><br />
            Email: admin@unoskors.com<br />
            Password: password123
          </div>

        </div>
      </div>
    </div>
  );
}
