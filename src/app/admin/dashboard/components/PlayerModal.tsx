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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bezel-outer max-w-sm w-full animate-bounce-short" style={{ animationDuration: '4s' }}>
        <div className="bezel-inner p-6 space-y-4">
          
          <div className="space-y-1">
            <h4 className="text-md font-bold font-display">
              {mode === 'create' ? 'Tambah Pemain Baru' : 'Edit Nama Pemain'}
            </h4>
            <p className="text-xs text-zinc-500">Ketik nama untuk didaftarkan ke database Supabase.</p>
          </div>

          <form onSubmit={onSave} className="space-y-4">
            <input
              type="text"
              placeholder="Ketik nama pemain..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              required
              autoFocus
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-rose-500 text-zinc-200"
            />

            <div className="flex gap-3 justify-end text-xs font-bold">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-zinc-800 hover:bg-zinc-900 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-rose-500 dark:bg-rose-600 hover:bg-rose-600 text-white shadow-md transition-colors"
              >
                Simpan
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
