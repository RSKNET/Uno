"use client";

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export function MaintenanceGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
      if (isStandalone && !pathname?.startsWith('/admin')) {
        router.replace('/admin');
        return;
      }
    }

    const isAdminRoute = pathname?.startsWith('/admin');

    const checkMaintenance = async () => {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'maintenance_mode')
          .maybeSingle();

        if (error) {
          console.error('Error fetching maintenance setting:', error);
          setLoading(false);
          return;
        }

        const isMaintenance = data?.value === 'true';

        if (isMaintenance && !isAdminRoute && pathname !== '/maintenance') {

          if (pathname) {
            sessionStorage.setItem('last_path', pathname);
          }
          router.push('/maintenance');
        } else if (!isMaintenance && pathname === '/maintenance') {
          const lastPath = sessionStorage.getItem('last_path') || '/';
          sessionStorage.removeItem('last_path');
          router.push(lastPath);
        }
      } catch (err) {
        console.error('Failed to run maintenance check:', err);
      } finally {
        setLoading(false);
      }
    };


    checkMaintenance();


    const channel = supabase
      .channel('public:settings')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'settings',
        },
        (payload) => {
          if (payload.new && (payload.new as any).key === 'maintenance_mode') {
            const isMaintenance = (payload.new as any).value === 'true';

            if (isMaintenance && !isAdminRoute && pathname !== '/maintenance') {
              if (pathname) {
                sessionStorage.setItem('last_path', pathname);
              }
              router.push('/maintenance');
            } else if (!isMaintenance && pathname === '/maintenance') {
              const lastPath = sessionStorage.getItem('last_path') || '/';
              sessionStorage.removeItem('last_path');
              router.push(lastPath);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pathname, router]);


  const isMaintenancePage = pathname === '/maintenance';
  const isAdmin = pathname?.startsWith('/admin');

  if (loading && !isMaintenancePage && !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-400">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-400"></div>
          <span className="text-xs tracking-wider uppercase opacity-80 font-medium">Checking System...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
