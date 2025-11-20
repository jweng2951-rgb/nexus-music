import React from 'react';
import { User, UserRole } from '../types';
import { 
  LayoutDashboard, 
  Users, 
  Music, 
  Upload, 
  LogOut, 
  Menu,
  X,
  AlertTriangle,
  Sparkles,
  Radio
} from 'lucide-react';

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
        { 
            id: 'settings', 
            label: 'Channel Manager',
            icon: Radio,
        },
      ];

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-900 font-sans">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-20 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 shadow-sm transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-200">
                <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-slate-800 tracking-tight">Nexus<span className="text-indigo-600">Music</span></span>
          </div>
          <button className="lg:hidden ml-auto text-slate-400 hover:text-slate-600" onClick={() => setIsSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="flex items-center space-x-3 mb-6 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-sm">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="font-semibold text-slate-800 truncate text-sm">{user.username}</p>
              <p className="text-xs text-slate-500 truncate">{isAdmin ? 'Administrator' : 'Creator Account'}</p>
            </div>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group font-medium text-sm
                    ${isActive 
                        ? 'bg-indigo-50 text-indigo-700' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                  `}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="absolute bottom-0 w-full p-4 border-t border-slate-100">
          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-3 py-2 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all text-sm font-medium"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-20 shadow-sm">
            <div className="flex items-center">
                <button 
                    className="lg:hidden p-2 -ml-2 text-slate-500 mr-2"
                    onClick={() => setIsSidebarOpen(true)}
                >
                    <Menu className="w-6 h-6" />
                </button>
                <h1 className="text-lg font-bold text-slate-800 tracking-tight">
                    {menuItems.find(m => m.id === activeTab)?.label}
                </h1>
            </div>
            
            <div className="flex items-center gap-4">
                <div className="text-sm text-slate-500 font-medium">
                    {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
            </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6 lg:p-8 bg-slate-50">
            <div className="max-w-7xl mx-auto space-y-6 pb-10">
                {children}
            </div>
        </div>
      </main>
    </div>
  );
};