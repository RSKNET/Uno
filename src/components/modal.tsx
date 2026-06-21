import React from 'react';
import { AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

interface CustomModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  type?: 'alert' | 'confirm';
  severity?: 'info' | 'warning' | 'error' | 'success';
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

export function CustomModal({
  isOpen,
  title,
  message,
  type = 'confirm',
  severity = 'warning',
  confirmLabel = 'Ya',
  cancelLabel = 'Batal',
  onConfirm,
  onCancel
}: CustomModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300">
      <div className="bezel-outer max-w-sm w-full animate-bounce-short relative" style={{ animationDuration: '4s' }}>
        <div className="bezel-inner p-6 space-y-4 bg-zinc-950/90">
          

          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-xl shrink-0 ${
              severity === 'error' ? 'bg-red-500/10 text-red-500' :
              severity === 'success' ? 'bg-emerald-500/10 text-emerald-500' :
              severity === 'info' ? 'bg-blue-500/10 text-blue-500' :
              'bg-amber-500/10 text-amber-500'
            }`}>
              {severity === 'error' || severity === 'warning' ? <AlertTriangle className="w-5 h-5" /> :
               severity === 'success' ? <CheckCircle2 className="w-5 h-5" /> :
               <Info className="w-5 h-5" />}
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold font-display text-zinc-100 uppercase tracking-wider">
                {title}
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {message}
              </p>
            </div>
          </div>


          <div className="flex items-center justify-end gap-2.5 pt-2">
            {type === 'confirm' && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-zinc-100 transition-colors uppercase tracking-wider bg-transparent border border-transparent hover:border-zinc-800 rounded-xl"
              >
                {cancelLabel}
              </button>
            )}
            
            <button
              type="button"
              onClick={onConfirm}
              className={`px-4 py-2 text-xs font-extrabold text-white rounded-xl uppercase tracking-wider transition-all active:scale-95 ${
                severity === 'error' ? 'bg-red-500 hover:bg-red-600' :
                severity === 'success' ? 'bg-emerald-500 hover:bg-emerald-600' :
                severity === 'info' ? 'bg-blue-500 hover:bg-blue-600' :
                'bg-rose-500 hover:bg-rose-600'
              }`}
            >
              {confirmLabel}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
