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
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 h-[100dvh] sticky top-0 border-r border-zinc-800 bg-[#0C0C0F] p-6 shrink-0 space-y-6 select-none font-mono">
        <div className="flex items-center gap-2 px-2">
          <Shield className="w-5 h-5 text-red-500" />
          <span className="text-[11px] font-black tracking-widest uppercase text-white">
            UNO_ADMIN_PORTAL
          </span>
        </div>
        
        <div className="w-full h-px bg-zinc-800" />

        <nav className="flex-1 flex flex-col gap-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full text-left flex items-center gap-3 px-3 py-2.5 text-[11px] tracking-wider transition-colors rounded-none font-black uppercase whitespace-nowrap
              ${activeTab === 'dashboard' 
                ? 'bg-[#1A0C0C] border-l-4 border-red-500 text-red-500' 
                : 'text-zinc-500 hover:bg-[#121216] hover:text-zinc-200'
              }
            `}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            [ 01 // OVERVIEW ]
          </button>
          
          <button
            onClick={() => setActiveTab('play')}
            className={`w-full text-left flex items-center gap-3 px-3 py-2.5 text-[11px] tracking-wider transition-colors rounded-none font-black uppercase whitespace-nowrap
              ${activeTab === 'play' 
                ? 'bg-[#1A0C0C] border-l-4 border-red-500 text-red-500' 
                : 'text-zinc-500 hover:bg-[#121216] hover:text-zinc-200'
              }
            `}
          >
            <Swords className="w-4 h-4 shrink-0" />
            [ 02 // INITIATE ]
          </button>

          <button
            onClick={() => setActiveTab('player')}
            className={`w-full text-left flex items-center gap-3 px-3 py-2.5 text-[11px] tracking-wider transition-colors rounded-none font-black uppercase whitespace-nowrap
              ${activeTab === 'player' 
                ? 'bg-[#1A0C0C] border-l-4 border-red-500 text-red-500' 
                : 'text-zinc-500 hover:bg-[#121216] hover:text-zinc-200'
              }
            `}
          >
            <Users className="w-4 h-4 shrink-0" />
            [ 03 // PLAYERS ]
          </button>

          <button
            onClick={() => setActiveTab('report')}
            className={`w-full text-left flex items-center gap-3 px-3 py-2.5 text-[11px] tracking-wider transition-colors rounded-none font-black uppercase whitespace-nowrap
              ${activeTab === 'report' 
                ? 'bg-[#1A0C0C] border-l-4 border-red-500 text-red-500' 
                : 'text-zinc-500 hover:bg-[#121216] hover:text-zinc-200'
              }
            `}
          >
            <FileText className="w-4 h-4 shrink-0" />
            [ 04 // REPORTS ]
          </button>

          <button
            onClick={() => setActiveTab('setting')}
            className={`w-full text-left flex items-center gap-3 px-3 py-2.5 text-[11px] tracking-wider transition-colors rounded-none font-black uppercase whitespace-nowrap
              ${activeTab === 'setting' 
                ? 'bg-[#1A0C0C] border-l-4 border-red-500 text-red-500' 
                : 'text-zinc-500 hover:bg-[#121216] hover:text-zinc-200'
              }
            `}
          >
            <Settings className="w-4 h-4 shrink-0" />
            [ 05 // SETTINGS ]
          </button>
        </nav>

        <div className="w-full h-px bg-zinc-800" />

        <div className="space-y-4">
          <div className="flex items-center gap-3 px-3 py-2 bg-[#121216] border border-zinc-800 rounded-none">
            {avatarUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-8 h-8 rounded-none object-cover border border-zinc-800 shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-none bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 font-black text-xs shrink-0">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0 font-mono">
              <p className="text-[10px] font-black text-zinc-300 truncate uppercase">{displayName}</p>
              <p className="text-[8px] text-zinc-600 truncate uppercase mt-0.5">{user?.email}</p>
            </div>
          </div>
          
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#121216] border border-zinc-800 hover:border-red-500 hover:bg-zinc-900 text-red-500 font-black text-xs uppercase tracking-widest transition-colors rounded-none cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            [ LOGOUT ]
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <aside className="flex lg:hidden flex-col w-12 h-[100dvh] sticky top-0 border-l border-zinc-800 bg-[#0C0C0F] py-6 items-center shrink-0 space-y-6 order-last z-20 select-none font-mono">
        <div className="p-2">
          <Shield className="w-5 h-5 text-red-500" />
        </div>

        <div className="w-10 h-px bg-zinc-800" />

        <nav className="flex-1 flex flex-col gap-3 w-full">
          <div className="relative group flex justify-center w-full">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`p-2 rounded-none transition-colors flex justify-center
                ${activeTab === 'dashboard' 
                  ? 'bg-[#1A0C0C] text-red-500 border-l-2 border-red-500' 
                  : 'text-zinc-500 hover:text-zinc-200'
                }
              `}
            >
              <LayoutDashboard className="w-4 h-4" />
            </button>
            <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-[#0A0A0C] border border-red-500 text-red-500 text-[9px] font-bold rounded-none opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 uppercase">
              OVERVIEW
            </div>
          </div>

          <div className="relative group flex justify-center w-full">
            <button
              onClick={() => setActiveTab('play')}
              className={`p-2 rounded-none transition-colors flex justify-center
                ${activeTab === 'play' 
                  ? 'bg-[#1A0C0C] text-red-500 border-l-2 border-red-500' 
                  : 'text-zinc-500 hover:text-zinc-200'
                }
              `}
            >
              <Swords className="w-4 h-4" />
            </button>
            <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-[#0A0A0C] border border-red-500 text-red-500 text-[9px] font-bold rounded-none opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 uppercase">
              INITIATE
            </div>
          </div>

          <div className="relative group flex justify-center w-full">
            <button
              onClick={() => setActiveTab('player')}
              className={`p-2 rounded-none transition-colors flex justify-center
                ${activeTab === 'player' 
                  ? 'bg-[#1A0C0C] text-red-500 border-l-2 border-red-500' 
                  : 'text-zinc-500 hover:text-zinc-200'
                }
              `}
            >
              <Users className="w-4 h-4" />
            </button>
            <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-[#0A0A0C] border border-red-500 text-red-500 text-[9px] font-bold rounded-none opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 uppercase">
              PLAYERS
            </div>
          </div>

          <div className="relative group flex justify-center w-full">
            <button
              onClick={() => setActiveTab('report')}
              className={`p-2 rounded-none transition-colors flex justify-center
                ${activeTab === 'report' 
                  ? 'bg-[#1A0C0C] text-red-500 border-l-2 border-red-500' 
                  : 'text-zinc-500 hover:text-zinc-200'
                }
              `}
            >
              <FileText className="w-4 h-4" />
            </button>
            <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-[#0A0A0C] border border-red-500 text-red-500 text-[9px] font-bold rounded-none opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 uppercase">
              REPORTS
            </div>
          </div>

          <div className="relative group flex justify-center w-full">
            <button
              onClick={() => setActiveTab('setting')}
              className={`p-2 rounded-none transition-colors flex justify-center
                ${activeTab === 'setting' 
                  ? 'bg-[#1A0C0C] text-red-500 border-l-2 border-red-500' 
                  : 'text-zinc-500 hover:text-zinc-200'
                }
              `}
            >
              <Settings className="w-4 h-4" />
            </button>
            <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-[#0A0A0C] border border-red-500 text-red-500 text-[9px] font-bold rounded-none opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 uppercase">
              SETTINGS
            </div>
          </div>
        </nav>

        <div className="w-10 h-px bg-zinc-800" />

        <div className="flex flex-col items-center gap-3 w-full">
          <div className="relative group flex justify-center w-full">
            {avatarUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-8 h-8 rounded-none object-cover border border-zinc-800 cursor-pointer shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-none bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 font-bold text-xs cursor-pointer shrink-0">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-[#0A0A0C] border border-zinc-800 text-zinc-300 text-[9px] font-bold rounded-none opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 uppercase">
              {displayName}
            </div>
          </div>

          <div className="relative group flex justify-center w-full">
            <button
              onClick={onLogout}
              className="p-2 rounded-none border border-zinc-800 text-red-500 hover:bg-zinc-900 transition-colors flex justify-center"
            >
              <LogOut className="w-4 h-4" />
            </button>
            <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-[#0A0A0C] border border-red-500 text-red-500 text-[9px] font-bold rounded-none opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 uppercase">
              LOGOUT
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
