"use client";

import { useEffect, useState } from 'react';
import { Wifi, WifiOff, CloudLightning, CheckCircle2, AlertCircle } from 'lucide-react';
import { syncOfflineData } from '@/lib/sync';
import { localDb } from '@/lib/db';

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'info' | 'error';
}

export function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(() => typeof window !== 'undefined' ? navigator.onLine : true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [unsyncedCount, setUnsyncedCount] = useState<number>(0);
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'info' });

  function showToast(message: string, type: 'success' | 'info' | 'error') {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 5000);
  }

  useEffect(() => {
    const updateQueueCount = async () => {
      const count = await localDb.syncQueue.count();
      setUnsyncedCount(count);
    };

    updateQueueCount();
    const interval = setInterval(updateQueueCount, 3000);

    const handleOnline = async () => {
      setIsOnline(true);
      showToast('Koneksi internet terhubung kembali.', 'info');
      setIsSyncing(true);
      const res = await syncOfflineData();
      setIsSyncing(false);
      if (res.success && res.count > 0) {
        showToast('Koneksi kembali terhubung. Data permainan berhasil disinkronkan ke cloud!', 'success');
      } else if (!res.success) {
        showToast(`Sinkronisasi gagal: ${res.message}`, 'error');
      }
      updateQueueCount();
    };

    const handleOffline = () => {
      setIsOnline(false);
      showToast('Koneksi terputus. Mode offline diaktifkan.', 'info');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      <div className="fixed bottom-4 left-4 z-50 pointer-events-auto">
        <div className={`
          flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold
          backdrop-blur-md shadow-lg border transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
          ${isOnline 
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
          }
        `}>
          <div className="relative flex h-2 w-2">
            <span className={`
              animate-ping absolute inline-flex h-full w-full rounded-full opacity-75
              ${isOnline ? 'bg-emerald-400' : 'bg-amber-400'}
            `}></span>
            <span className={`
              relative inline-flex rounded-full h-2 w-2
              ${isOnline ? 'bg-emerald-500' : 'bg-amber-500'}
            `}></span>
          </div>

          <span className="flex items-center gap-1 select-none">
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5" />
                Online
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5" />
                Offline Mode
              </>
            )}
            
            {unsyncedCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-black/40 text-[9px] text-zinc-300 font-mono flex items-center gap-0.5">
                <CloudLightning className="w-2.5 h-2.5 text-amber-400 animate-pulse" />
                {unsyncedCount}
              </span>
            )}
          </span>

          {isSyncing && (
            <span className="text-[10px] text-zinc-400 border-l border-zinc-500/20 pl-2 animate-pulse">
              Syncing...
            </span>
          )}
        </div>
      </div>

      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 pointer-events-auto max-w-sm w-full animate-bounce-short">
          <div className={`
            flex items-start gap-3 p-4 rounded-2xl shadow-xl border backdrop-blur-xl
            transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]
            ${toast.type === 'success' 
              ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-100' 
              : toast.type === 'error'
              ? 'bg-red-950/80 border-red-500/30 text-red-100'
              : 'bg-zinc-900/90 border-zinc-700/50 text-zinc-100'
            }
          `}>
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Wifi className="w-5 h-5 text-zinc-400 shrink-0 mt-0.5" />}

            <div className="flex-1 text-sm font-medium leading-5">
              {toast.message}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
