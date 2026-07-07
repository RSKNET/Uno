"use client";

import { 
  Shield, 
  LogOut, 
  Users, 
  Settings, 
  LayoutDashboard, 
  FileText,
  Swords
} from 'lucide-react';
import type { User } from '@supabase/supabase-js';

interface SidebarProps {
  activeTab: 'dashboard' | 'player' | 'report' | 'setting' | 'play';
  setActiveTab: (tab: 'dashboard' | 'player' | 'report' | 'setting' | 'play') => void;
  user?: User | null;
  onLogout: () => Promise<void>;
}

export default function Sidebar({ activeTab, setActiveTab, user, onLogout }: SidebarProps) {
  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || 'Admin';
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  return (
    <>
      <aside className="hidden lg:flex flex-col w-64 h-[100dvh] sticky top-0 border-r border-zinc-800/60 bg-[#070709]/80 p-6 shrink-0 space-y-6">
        <div className="flex items-center gap-2 px-2">
          <Shield className="w-5 h-5 text-rose-500" />
          <span className="font-display font-extrabold tracking-tight text-sm uppercase">Uno Portal Admin</span>
        </div>
        
        <div className="w-full h-px bg-zinc-800/60" />

        <nav className="flex-1 flex flex-col gap-1.5">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all
              ${activeTab === 'dashboard' 
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/10' 
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'
              }
            `}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('play')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all
              ${activeTab === 'play' 
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/10' 
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'
              }
            `}
          >
            <Swords className="w-4 h-4" />
            Mulai Game
          </button>
          <button
            onClick={() => setActiveTab('player')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all
              ${activeTab === 'player' 
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/10' 
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'
              }
            `}
          >
            <Users className="w-4 h-4" />
            Daftar Pemain
          </button>
          <button
            onClick={() => setActiveTab('report')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all
              ${activeTab === 'report' 
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/10' 
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'
              }
            `}
          >
            <FileText className="w-4 h-4" />
            Laporan Game
          </button>
          <button
            onClick={() => setActiveTab('setting')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all
              ${activeTab === 'setting' 
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/10' 
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'
              }
            `}
          >
            <Settings className="w-4 h-4" />
            Pengaturan
          </button>
        </nav>

        <div className="w-full h-px bg-zinc-800/60" />

        <div className="space-y-3">
          <div className="flex items-center gap-3 px-2 py-1.5 bg-zinc-900/20 rounded-xl border border-zinc-800/40">
            {avatarUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-9 h-9 rounded-xl object-cover border border-zinc-800"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 font-bold text-sm shrink-0">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-zinc-200 truncate">{displayName}</p>
              <p className="text-[10px] text-zinc-500 truncate mt-0.5">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-zinc-800 hover:bg-zinc-900 transition-colors text-xs font-bold text-red-500"
          >
            <LogOut className="w-4 h-4" />
            Keluar
          </button>
        </div>
      </aside>

      <aside className="flex lg:hidden flex-col w-12 h-[100dvh] sticky top-0 border-l border-zinc-800 bg-[#070709]/80 py-6 items-center shrink-0 space-y-6 order-last z-20">
        <div className="p-2">
          <Shield className="w-5 h-5 text-rose-500" />
        </div>

        <div className="w-10 h-px bg-zinc-800/60" />

        <nav className="flex-1 flex flex-col gap-3 w-full">
          <div className="relative group flex justify-center w-full">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`p-2 rounded-xl transition-all flex justify-center
                ${activeTab === 'dashboard' 
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/10' 
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'
                }
              `}
            >
              <LayoutDashboard className="w-4 h-4" />
            </button>
            <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-200 text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-md">
              Dashboard
            </div>
          </div>

          <div className="relative group flex justify-center w-full">
            <button
              onClick={() => setActiveTab('play')}
              className={`p-2 rounded-xl transition-all flex justify-center
                ${activeTab === 'play' 
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/10' 
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'
                }
              `}
            >
              <Swords className="w-4 h-4" />
            </button>
            <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-200 text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-md">
              Mulai Game
            </div>
          </div>

          <div className="relative group flex justify-center w-full">
            <button
              onClick={() => setActiveTab('player')}
              className={`p-2 rounded-xl transition-all flex justify-center
                ${activeTab === 'player' 
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/10' 
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'
                }
              `}
            >
              <Users className="w-4 h-4" />
            </button>
            <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-200 text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-md">
              Daftar Pemain
            </div>
          </div>

          <div className="relative group flex justify-center w-full">
            <button
              onClick={() => setActiveTab('report')}
              className={`p-2 rounded-xl transition-all flex justify-center
                ${activeTab === 'report' 
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/10' 
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'
                }
              `}
            >
              <FileText className="w-4 h-4" />
            </button>
            <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-200 text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-md">
              Laporan Game
            </div>
          </div>

          <div className="relative group flex justify-center w-full">
            <button
              onClick={() => setActiveTab('setting')}
              className={`p-2 rounded-xl transition-all flex justify-center
                ${activeTab === 'setting' 
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/10' 
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'
                }
              `}
            >
              <Settings className="w-4 h-4" />
            </button>
            <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-200 text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-md">
              Pengaturan
            </div>
          </div>
        </nav>

        <div className="w-10 h-px bg-zinc-800/60" />

        <div className="flex flex-col items-center gap-3 w-full">
          <div className="relative group flex justify-center w-full">
            {avatarUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-8 h-8 rounded-lg object-cover border border-zinc-800 cursor-pointer"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 font-bold text-xs cursor-pointer">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-200 text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-md">
              {displayName}
            </div>
          </div>

          <div className="relative group flex justify-center w-full">
            <button
              onClick={onLogout}
              className="p-2 rounded-xl border border-zinc-800 text-red-500 hover:bg-zinc-900 transition-colors flex justify-center"
            >
              <LogOut className="w-4 h-4" />
            </button>
            <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 text-red-400 text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-md">
              Keluar
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
