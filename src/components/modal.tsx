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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300 font-mono select-none">
      <div className="max-w-md w-full border-2 border-zinc-800 bg-[#0C0C0F] p-6 relative rounded-none">
        
        {/* Tactical Grid Crosshairs */}
        <span className="absolute -top-2 -left-2 font-black text-red-500 select-none">+</span >
        <span className="absolute -top-2 -right-2 font-black text-red-500 select-none">+</span >
        <span className="absolute -bottom-3 -left-2 font-black text-red-500 select-none">+</span >
        <span className="absolute -bottom-3 -right-2 font-black text-red-500 select-none">+</span >

        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className={`p-2 border rounded-none shrink-0 ${
              severity === 'error' ? 'bg-red-500/10 text-red-500 border-red-500/30' :
              severity === 'success' ? 'bg-green-500/10 text-green-500 border-green-500/30' :
              severity === 'info' ? 'bg-blue-500/10 text-blue-500 border-blue-500/30' :
              'bg-amber-500/10 text-amber-500 border-amber-500/30'
            }`}>
              {severity === 'error' || severity === 'warning' ? <AlertTriangle className="w-5 h-5" /> :
               severity === 'success' ? <CheckCircle2 className="w-5 h-5" /> :
               <Info className="w-5 h-5" />}
            </div>
            
            <div className="space-y-1.5 flex-1 min-w-0">
              <h4 className="text-xs font-black uppercase text-[#FFFFFF] tracking-wider truncate">
                [ {title} ]
              </h4>
              <p className="text-[10px] text-zinc-500 leading-relaxed uppercase">
                {message}
              </p>
            </div>
          </div>

          <div className="w-full h-px bg-zinc-800" />

          <div className="flex items-center justify-end gap-3 pt-2 font-bold text-xs">
            {type === 'confirm' && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2.5 bg-[#121216] border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors rounded-none uppercase cursor-pointer"
              >
                [ {cancelLabel} ]
              </button>
            )}
            
            <button
              type="button"
              onClick={onConfirm}
              className={`px-5 py-2.5 text-white transition-colors border-b-2 rounded-none uppercase cursor-pointer ${
                severity === 'error' ? 'bg-red-600 hover:bg-red-700 border-red-800 active:border-b-0 active:translate-y-0.5' :
                severity === 'success' ? 'bg-green-600 hover:bg-green-700 border-green-800 active:border-b-0 active:translate-y-0.5' :
                severity === 'info' ? 'bg-blue-600 hover:bg-blue-700 border-blue-800 active:border-b-0 active:translate-y-0.5' :
                'bg-red-600 hover:bg-red-700 border-red-800 active:border-b-0 active:translate-y-0.5'
              }`}
            >
              [ {confirmLabel} ]
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
