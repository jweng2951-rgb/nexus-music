import React from 'react';
import { User, UserRole } from '../types';
import { LayoutDashboard, Users, Music, Upload, LogOut, Menu, X, ListVideo, Sparkles } from 'lucide-react';

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

  const menuItems = isAdmin 
    ? [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'users', label: 'User Manager', icon: Users },
        { id: 'music', label: 'Music Catalog', icon: Music },
        { id: 'data', label: 'Data Sync', icon: Upload },
      ]
    : [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'my-music', label: 'Music Catalog', icon: Music },
        { id: 'settings', label: 'My Channels', icon: ListVideo },
      ];

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {isSidebarOpen && (<div className="fixed inset-0 bg-black/20 z-20 lg:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />)}
      <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 shadow-sm transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <div className="flex items-center gap-2 text-indigo-600">
            <Sparkles className="w-6 h-6" />
            <span className="font-bold text-xl tracking-tight text-slate-900">Nexus<span className="text-indigo-600">Music</span></span>
          </div>
          <button className="lg:hidden ml-auto text-slate-400" onClick={() => setIsSidebarOpen(false)}><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-3 mb-6 p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">{user.username.charAt(0).toUpperCase()}</div>
            <div className="overflow-hidden"><p className="font-semibold text-sm truncate">{user.username}</p><p className="text-xs text-slate-500">{isAdmin ? 'Administrator' : 'Partner'}</p></div>
          </div>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button key={item.id} onClick={() => { onTabChange(item.id); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                  <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
        <div className="absolute bottom-0 w-full p-4 border-t border-slate-100">
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all text-sm font-medium"><LogOut className="w-5 h-5" /> Sign Out</button>
        </div>
      </aside>
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-10">
            <div className="flex items-center gap-4"><button className="lg:hidden text-slate-500" onClick={() => setIsSidebarOpen(true)}><Menu className="w-6 h-6" /></button><h1 className="text-lg font-bold text-slate-800">{menuItems.find(m => m.id === activeTab)?.label}</h1></div>
            <div className="text-sm text-slate-500 font-medium">{new Date().toLocaleDateString()}</div>
        </header>
        <div className="flex-1 overflow-auto p-6 lg:p-8 bg-slate-50">{children}</div>
      </main>
    </div>
  );
};