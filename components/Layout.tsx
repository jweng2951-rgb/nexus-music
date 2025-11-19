import React from 'react';
import { User, UserRole } from '../types';
import { LayoutDashboard, Users, Music, Upload, LogOut, Settings, Menu, X, Sparkles, AlertTriangle } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, activeTab, onTabChange }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const isAdmin = user.role === UserRole.ADMIN;
  const hasChannelBound = !!user.channelId;

  const menuItems = isAdmin 
    ? [
        { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
        { id: 'users', label: 'User Management', icon: Users },
        { id: 'music', label: 'Music Library', icon: Music },
        { id: 'data', label: 'Data Import', icon: Upload },
      ]
    : [
        { id: 'dashboard', label: 'My Dashboard', icon: LayoutDashboard },
        { id: 'my-music', label: 'My Music', icon: Music },
        { id: 'settings', label: hasChannelBound ? 'Channel Settings' : 'Bind Channel', icon: hasChannelBound ? Settings : AlertTriangle, highlight: !hasChannelBound },
      ];

  return (
    <div className="min-h-screen bg-slate-950 flex text-slate-200 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-950/80 z-20 lg:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
      )}
      <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-slate-900/60 backdrop-blur-xl border-r border-white/5 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/5">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20"><Sparkles className="w-5 h-5 text-white" /></div>
            <span className="font-bold text-lg text-white tracking-tight">Nexus Music</span>
          </div>
          <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setIsSidebarOpen(false)}><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4">
          <div className="flex items-center space-x-3 mb-8 p-4 bg-white/5 rounded-2xl border border-white/5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center font-bold text-white shadow-inner text-sm">{user.username.charAt(0).toUpperCase()}</div>
            <div className="overflow-hidden">
              <p className="font-semibold text-white truncate text-sm">{user.username}</p>
              <p className="text-xs text-slate-400 truncate">{isAdmin ? 'Administrator' : 'Creator Account'}</p>
            </div>
          </div>
          <div className="space-y-1">
            <p className="px-3 text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Menu</p>
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button key={item.id} onClick={() => { onTabChange(item.id); setIsSidebarOpen(false); }} className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 group ${isActive ? 'bg-gradient-to-r from-indigo-600/90 to-violet-600/90 text-white shadow-md shadow-indigo-900/20' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}>
                    {/* @ts-ignore */}
                    <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-white' : item.highlight ? 'text-amber-400 animate-pulse' : 'text-slate-500 group-hover:text-slate-300'}`} />
                    {/* @ts-ignore */}
                    <span className={`font-medium text-sm ${item.highlight ? 'text-amber-400' : ''}`}>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
        <div className="absolute bottom-0 w-full p-4 border-t border-white/5">
          <button onClick={onLogout} className="w-full flex items-center space-x-3 px-3 py-3 text-slate-400 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all">
            <LogOut className="w-5 h-5" /><span className="font-medium text-sm">Sign Out</span>
          </button>
        </div>
      </aside>
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-20 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-20">
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md border-b border-white/5" />
            <div className="relative z-10 flex items-center">
                <button className="lg:hidden p-2 -ml-2 text-slate-400 mr-2" onClick={() => setIsSidebarOpen(true)}><Menu className="w-6 h-6" /></button>
                <h1 className="text-xl font-bold text-white tracking-tight">{menuItems.find(m => m.id === activeTab)?.label}</h1>
            </div>
        </header>
        <div className="flex-1 overflow-auto p-6 lg:p-10 relative z-0">
            <div className="fixed top-0 left-64 w-96 h-96 bg-indigo-600/10 rounded-full blur-[128px] pointer-events-none -z-10" />
            <div className="fixed bottom-0 right-0 w-96 h-96 bg-violet-600/10 rounded-full blur-[128px] pointer-events-none -z-10" />
            <div className="max-w-7xl mx-auto space-y-8 pb-10">{children}</div>
        </div>
      </main>
    </div>
  );
};