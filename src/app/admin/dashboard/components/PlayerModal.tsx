"use client";

import React from 'react';

interface PlayerModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  name: string;
  setName: (name: string) => void;
  onSave: (e: React.FormEvent) => void;
  onClose: () => void;
}

export default function PlayerModal({
  isOpen,
  mode,
  name,
  setName,
  onSave,
  onClose
}: PlayerModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full border-2 border-zinc-800 bg-[#0C0C0F] relative p-6 space-y-6 rounded-none">
        
        {/* Tactical Grid Crosshairs */}
        <span className="absolute -top-2 -left-2 font-black text-red-500 select-none">+</span >
        <span className="absolute -top-2 -right-2 font-black text-red-500 select-none">+</span >
        <span className="absolute -bottom-3 -left-2 font-black text-red-500 select-none">+</span >
        <span className="absolute -bottom-3 -right-2 font-black text-red-500 select-none">+</span >

        <div className="space-y-1 pb-2 border-b border-zinc-800 font-mono">
          <h4 className="text-sm font-black uppercase tracking-widest text-[#FFFFFF]">
            {mode === 'create' ? '[ REGISTER NEW PLAYER ]' : '[ EDIT PLAYER ENTRY ]'}
          </h4>
          <p className="text-[10px] text-zinc-500 uppercase">
            INPUT CORRESPONDING USERNAME TO ARCHIVE IN SUPABASE.
          </p>
        </div>

        <form onSubmit={onSave} className="space-y-5 font-mono">
          <input
            type="text"
            placeholder="INPUT NAME..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
            required
            autoFocus
            className="w-full bg-[#121216] border border-zinc-800 px-3 py-2.5 text-xs font-bold focus:outline-none focus:border-red-500 text-zinc-200 rounded-none uppercase"
          />

          <div className="flex gap-3 justify-end text-xs font-bold">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#121216] border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors rounded-none uppercase cursor-pointer"
            >
              [ CANCEL ]
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white transition-colors rounded-none border-b-2 border-red-800 active:border-b-0 active:translate-y-0.5 uppercase cursor-pointer"
            >
              [ SUBMIT ]
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
