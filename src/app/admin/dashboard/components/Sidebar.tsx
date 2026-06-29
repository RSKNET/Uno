"use client";

import { 
  Shield, 
  LogOut, 
  Users, 
  Settings, 
  LayoutDashboard, 
  FileText 
} from 'lucide-react';

interface SidebarProps {
  activeTab: 'dashboard' | 'player' | 'report' | 'setting';
  setActiveTab: (tab: 'dashboard' | 'player' | 'report' | 'setting') => void;
  email?: string;
  onLogout: () => Promise<void>;
}

export default function Sidebar({ activeTab, setActiveTab, email, onLogout }: SidebarProps) {
  return (
    <>
      <aside className="hidden lg:flex flex-col w-64 border-r border-zinc-800/60 bg-[#070709]/80 p-6 shrink-0 space-y-6">
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
          <div className="px-2 truncate">
            <p className="text-[10px] uppercase font-bold text-zinc-500">Akun Login</p>
            <p className="text-xs font-mono text-zinc-400 truncate mt-0.5">{email}</p>
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

      <aside className="flex lg:hidden flex-col w-16 border-l border-zinc-800 bg-[#070709]/80 py-6 items-center shrink-0 space-y-6 order-last">
        <div className="p-2">
          <Shield className="w-5 h-5 text-rose-500" />
        </div>

        <div className="w-10 h-px bg-zinc-800/60" />

        <nav className="flex-1 flex flex-col gap-3">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`p-3 rounded-xl transition-all flex justify-center
              ${activeTab === 'dashboard' 
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/10' 
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'
              }
            `}
            title="Dashboard"
          >
            <LayoutDashboard className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTab('player')}
            className={`p-3 rounded-xl transition-all flex justify-center
              ${activeTab === 'player' 
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/10' 
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'
              }
            `}
            title="Daftar Pemain"
          >
            <Users className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTab('report')}
            className={`p-3 rounded-xl transition-all flex justify-center
              ${activeTab === 'report' 
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/10' 
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'
              }
            `}
            title="Laporan Game"
          >
            <FileText className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTab('setting')}
            className={`p-3 rounded-xl transition-all flex justify-center
              ${activeTab === 'setting' 
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/10' 
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'
              }
            `}
            title="Pengaturan"
          >
            <Settings className="w-4 h-4" />
          </button>
        </nav>

        <div className="w-10 h-px bg-zinc-800/60" />

        <button
          onClick={onLogout}
          className="p-3 rounded-xl border border-zinc-800 text-red-500 hover:bg-zinc-900 transition-colors flex justify-center"
          title="Keluar"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </aside>
    </>
  );
}
