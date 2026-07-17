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
    setToast({ show: true, message: message.toUpperCase(), type });
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
      {/* Toast Notification Alert */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 pointer-events-auto max-w-sm w-full animate-bounce-short font-mono select-none">
          <div className={`
            flex items-start gap-3.5 p-4 border backdrop-blur-md shadow-lg rounded-none relative
            ${toast.type === 'success' 
              ? 'bg-[#0E1A12] border-green-500 text-green-100' 
              : toast.type === 'error'
              ? 'bg-[#1A0C0C] border-red-500 text-red-100'
              : 'bg-[#0C0C0F] border-zinc-800 text-zinc-100'
            }
          `}>
            {/* Tactical Grid Crosshairs */}
            <span className="absolute -top-2 -left-2 font-black text-red-500 select-none">+</span >
            <span className="absolute -top-2 -right-2 font-black text-red-500 select-none">+</span >
            <span className="absolute -bottom-3 -left-2 font-black text-red-500 select-none">+</span >
            <span className="absolute -bottom-3 -right-2 font-black text-red-500 select-none">+</span >

            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Wifi className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />}

            <div className="flex-1 text-[10px] font-black uppercase tracking-wide leading-relaxed">
              {toast.message}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
