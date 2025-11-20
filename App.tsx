
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { AdminUserManagement } from './components/AdminUserManagement';
import { AdminDataUpload } from './components/AdminDataUpload';
import { DashboardStats } from './components/DashboardStats';
import { MusicLibrary } from './components/MusicLibrary';
import { UserSettings } from './components/UserSettings';
import { User, UserRole, CsvRow, ChannelStats, MusicTrack, Channel } from './types';
import { dataService } from './services/dataService';
import { ArrowRight, ArrowLeft, Sparkles, Loader2, Check, Copy, XCircle, CheckCircle2, Info } from 'lucide-react';

// Toast Type Definition
type ToastType = 'success' | 'error' | 'info';
interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [musicList, setMusicList] = useState<MusicTrack[]>([]);
  
  // Stats containers
  const [userStatsMap, setUserStatsMap] = useState<Record<string, ChannelStats>>({});
  const [viewingChannelStats, setViewingChannelStats] = useState<ChannelStats | null>(null);
  const [viewingChannelId, setViewingChannelId] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [copyLink, setCopyLink] = useState(false);
  
  // Drill-down state
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  
  // Login State
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Toast State
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType = 'success') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      try {
        await dataService.initialize();
        const [users, music, stats] = await Promise.all([
          dataService.getUsers(),
          dataService.getMusic(),
          dataService.getUserStats()
        ]);
        setAllUsers(users);
        setMusicList(music);
        setUserStatsMap(stats);
      } catch (err) { console.error(err); } finally { setIsLoading(false); }
    };
    initData();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const users = await dataService.getUsers();
    setAllUsers(users);
    const user = users.find(u => u.username === loginUsername && u.password === loginPassword);
    if (user) {
      if (user.status === 'suspended') { setLoginError('Suspended'); return; }
      setCurrentUser(user);
      setActiveTab('dashboard');
      setLoginError('');
    } else { setLoginError('Invalid credentials'); }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setLoginUsername('');
    setLoginPassword('');
    setSelectedUserId(null);
    setViewingChannelId(null);
  };

  // --- Drill Down to Single Channel ---
  const handleViewChannelStats = async (channelId: string) => {
      setIsLoading(true);
      const stats = await dataService.getChannelStats(channelId);
      setViewingChannelStats(stats);
      setViewingChannelId(channelId);
      setActiveTab('channel_detail');
      setIsLoading(false);
  };

  const handleBackFromChannel = () => {
      setViewingChannelId(null);
      setViewingChannelStats(null);
      setActiveTab('settings'); // Go back to channel list
  };

  // --- CORE LOGIC: CSV Parsing & Revenue Distribution ---
  const handleDataParsed = async (rows: CsvRow[]) => {
    // 1. Fetch ALL mapped channels to know who owns what
    const allChannels = await dataService.getAllChannels();
    const channelOwnerMap = new Map<string, {userId: string, share: number}>();
    
    // Create lookup: ChannelID -> {OwnerID, SharePercentage}
    allChannels.forEach(ch => {
        const owner = allUsers.find(u => u.id === ch.userId);
        if (owner) {
            channelOwnerMap.set(ch.channelId, { userId: owner.id, share: owner.revenueShare });
        }
    });

    // 2. Prepare containers for aggregation
    // User Aggregate (for dashboard)
    const userAggregates: Record<string, { views: number; premium: number; gross: number; net: number; daily: any; countries: any }> = {};
    // Channel Specific (for drill-down)
    const channelAggregates: Record<string, { views: number; premium: number; gross: number; net: number; daily: any; countries: any }> = {};

    let matchedRows = 0;

    rows.forEach(row => {
        const ownerInfo = channelOwnerMap.get(row.channelId);
        if (ownerInfo) {
            matchedRows++;
            const { userId, share } = ownerInfo;
            const views = Number(row.views) || 0;
            const premium = Number(row.premiumViews) || 0;
            const grossRaw = Number(row.grossRevenue) || 0;
            const netCalculated = grossRaw * (share / 100); // Calculate NET immediately

            // A. Update User Aggregate
            if (!userAggregates[userId]) userAggregates[userId] = { views: 0, premium: 0, gross: 0, net: 0, daily: {}, countries: {} };
            const uAgg = userAggregates[userId];
            uAgg.views += views;
            uAgg.premium += premium;
            uAgg.gross += grossRaw;
            uAgg.net += netCalculated;

            // User Daily
            if (!uAgg.daily[row.date]) uAgg.daily[row.date] = { views: 0, premium: 0, net: 0 };
            uAgg.daily[row.date].views += views;
            uAgg.daily[row.date].premium += premium;
            uAgg.daily[row.date].net += netCalculated;

            // User Country
            const country = row.country || 'Unknown';
            if (!uAgg.countries[country]) uAgg.countries[country] = { views: 0, net: 0 };
            uAgg.countries[country].views += views;
            uAgg.countries[country].net += netCalculated;

            // B. Update Channel Specific
            if (!channelAggregates[row.channelId]) channelAggregates[row.channelId] = { views: 0, premium: 0, gross: 0, net: 0, daily: {}, countries: {} };
            const cAgg = channelAggregates[row.channelId];
            cAgg.views += views;
            cAgg.premium += premium;
            cAgg.gross += grossRaw;
            cAgg.net += netCalculated;

            if (!cAgg.daily[row.date]) cAgg.daily[row.date] = { views: 0, premium: 0, net: 0 };
            cAgg.daily[row.date].views += views;
            cAgg.daily[row.date].premium += premium;
            cAgg.daily[row.date].net += netCalculated;

            if (!cAgg.countries[country]) cAgg.countries[country] = { views: 0, net: 0 };
            cAgg.countries[country].views += views;
            cAgg.countries[country].net += netCalculated;
        }
    });

    // 3. Save Channel Stats to DB
    for (const [cid, raw] of Object.entries(channelAggregates)) {
        const dailyStats = Object.entries(raw.daily).map(([date, d]: any) => ({
            date, views: d.views, premiumViews: d.premium, estimatedRevenue: d.net, grossRevenue: 0 // Hide Gross from individual stats just in case
        })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        const topCountries = Object.entries(raw.countries).map(([code, d]: any) => ({
            code, views: d.views, revenue: d.net
        })).sort((a, b) => b.views - a.views);

        const statObj: ChannelStats = {
            totalViews: raw.views,
            totalPremiumViews: raw.premium,
            totalRevenue: raw.net,
            dailyStats,
            topCountries,
            lastUpdated: new Date().toISOString()
        };
        await dataService.saveChannelStats(cid, statObj);
    }

    // 4. Save User Stats to DB & State
    const newUserStats = { ...userStatsMap };
    for (const [uid, raw] of Object.entries(userAggregates)) {
        const dailyStats = Object.entries(raw.daily).map(([date, d]: any) => ({
            date, views: d.views, premiumViews: d.premium, estimatedRevenue: d.net, grossRevenue: 0
        })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        const topCountries = Object.entries(raw.countries).map(([code, d]: any) => ({
            code, views: d.views, revenue: d.net
        })).sort((a, b) => b.views - a.views);

        const statObj: ChannelStats = {
            totalViews: raw.views,
            totalPremiumViews: raw.premium,
            totalRevenue: raw.net,
            dailyStats,
            topCountries,
            lastUpdated: new Date().toISOString()
        };
        await dataService.saveUserStats(uid, statObj);
        newUserStats[uid] = statObj;
    }
    
    setUserStatsMap(newUserStats);
    showToast(`Sync Complete! Matched ${matchedRows} rows across all users.`, 'success');
  };

  const handleAddUser = async (user: Partial<User>) => {
    setIsLoading(true);
    const newUser: User = {
      id: user.id || `user-${Date.now()}`,
      username: user.username!,
      password: user.password!,
      role: user.role || UserRole.USER,
      revenueShare: user.revenueShare || 70,
      createdAt: new Date().toISOString(),
      status: 'active',
      channelId: user.channelId,
      channelName: user.channelName
    };
    await dataService.saveUser(newUser);
    const users = await dataService.getUsers();
    setAllUsers(users);
    setIsLoading(false);
    showToast('User created successfully');
  };

  const handleUpdateUser = async (id: string, updates: Partial<User>) => {
    setIsLoading(true);
    const user = allUsers.find(u => u.id === id);
    if (user) {
      const updatedUser = { ...user, ...updates };
      await dataService.saveUser(updatedUser);
      const users = await dataService.getUsers();
      setAllUsers(users);
      showToast('User updated successfully');
    }
    setIsLoading(false);
  };

  const handleDeleteUser = async (id: string) => {
    if (window.confirm('Are you sure? This will delete the user and their stats.')) {
        setIsLoading(true);
        await dataService.deleteUser(id);
        const users = await dataService.getUsers();
        setAllUsers(users);
        setIsLoading(false);
        showToast('User deleted');
    }
  };

  const handleExport = (userId?: string) => {
    // Export Logic
    const headers = ['ID', 'Username', 'Role', 'Revenue Share', 'Status'];
    const rows = allUsers.map(u => [u.id, u.username, u.role, u.revenueShare + '%', u.status]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(",") + "\n" 
        + rows.map(e => e.join(",")).join("\n");
        
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "users_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddTrack = async (track: MusicTrack) => {
      setIsLoading(true);
      await dataService.saveTrack(track);
      const music = await dataService.getMusic();
      setMusicList(music);
      setIsLoading(false);
      showToast('Track added successfully');
  };

  const handleDeleteTrack = async (id: string) => {
      if (window.confirm('Are you sure you want to delete this track?')) {
          setIsLoading(true);
          await dataService.deleteTrack(id);
          const music = await dataService.getMusic();
          setMusicList(music);
          setIsLoading(false);
          showToast('Track deleted');
      }
  };

  // --- Render ---
  if (isLoading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>;

  if (!currentUser) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-slate-950">
            {/* Background Effects */}
            <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[128px] pointer-events-none" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[128px] pointer-events-none" />

             <div className="w-full max-w-md relative z-10">
                <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-10 shadow-2xl">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 mx-auto mb-6">
                            <Sparkles className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-white">Nexus Music</h1>
                        <p className="text-slate-400 mt-2">Creator Management Portal</p>
                    </div>
                    
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Username</label>
                            <input 
                                type="text" 
                                className="w-full p-4 bg-black/30 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                                value={loginUsername} 
                                onChange={e=>setLoginUsername(e.target.value)}
                                placeholder="Enter your username" 
                            />
                        </div>
                        <div className="space-y-2">
                             <label className="text-xs font-bold text-slate-500 uppercase ml-1">Password</label>
                            <input 
                                type="password" 
                                className="w-full p-4 bg-black/30 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                                value={loginPassword} 
                                onChange={e=>setLoginPassword(e.target.value)}
                                placeholder="••••••••" 
                            />
                        </div>
                        <button type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-900/20 transform active:scale-[0.98]">
                            Sign In
                        </button>
                    </form>
                    {loginError && (
                        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
                            <XCircle className="w-5 h-5 text-red-400" />
                            <p className="text-red-300 text-sm font-medium">{loginError}</p>
                        </div>
                    )}
                </div>
                <p className="text-center text-slate-600 text-xs mt-8">Protected System &copy; 2024 Nexus Music Group</p>
             </div>
        </div>
      );
  }

  return (
    <Layout 
        user={currentUser} onLogout={handleLogout} activeTab={activeTab} 
        onTabChange={(tab) => { setActiveTab(tab); if(tab !== 'dashboard') setSelectedUserId(null); }}
    >
        {/* Toasts Overlay */}
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
            {toasts.map(t => (
                <div key={t.id} className={`toast-enter pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border backdrop-blur-md ${t.type==='success'?'bg-emerald-900/90 border-emerald-500/50 text-emerald-100':t.type==='error'?'bg-red-900/90 border-red-500/50 text-red-100':'bg-slate-800/90 border-white/10 text-white'}`}>
                    {t.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
                    {t.type === 'error' && <XCircle className="w-5 h-5" />}
                    {t.type === 'info' && <Info className="w-5 h-5" />}
                    <span className="font-medium">{t.message}</span>
                </div>
            ))}
        </div>

        {/* Channel Detail View (Available to both Admin and User) */}
        {activeTab === 'channel_detail' && (
            <div className="space-y-6 animate-fade-in">
                <button onClick={handleBackFromChannel} className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors group">
                    <div className="p-2 rounded-full bg-slate-800 group-hover:bg-indigo-600 transition-colors"><ArrowLeft className="w-4 h-4" /></div>
                    <span className="font-bold">Back to Channel List</span>
                </button>
                <div className="flex items-center gap-3 mb-4">
                    <span className="bg-red-600 text-white px-3 py-1 rounded text-xs font-bold uppercase tracking-wider">Channel Analysis</span>
                    <h2 className="text-2xl font-bold text-white font-mono tracking-tight">{viewingChannelId}</h2>
                </div>
                <DashboardStats 
                    title="Channel Specific Performance" 
                    stats={viewingChannelStats} 
                    revenueShare={currentUser.role === UserRole.ADMIN ? 100 : currentUser.revenueShare} 
                    showShareInfo={false} // Always hide share info on detail view to avoid confusion
                />
            </div>
        )}

        {/* Admin Views */}
        {currentUser.role === UserRole.ADMIN && activeTab !== 'channel_detail' && (
            <>
                {activeTab === 'dashboard' && !selectedUserId && (
                    <DashboardStats title="Global Overview" stats={Object.values(userStatsMap).reduce((acc, curr) => ({ totalViews: acc.totalViews + curr.totalViews, totalPremiumViews: acc.totalPremiumViews + curr.totalPremiumViews, totalRevenue: acc.totalRevenue + curr.totalRevenue, dailyStats: [], topCountries: [], lastUpdated: new Date().toISOString() }), { totalViews: 0, totalPremiumViews: 0, totalRevenue: 0, dailyStats: [], topCountries: [], lastUpdated: '' })} showShareInfo={false} />
                )}
                {activeTab === 'dashboard' && selectedUserId && (
                    <div className="space-y-6 animate-fade-in">
                        <button onClick={() => setSelectedUserId(null)} className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors group">
                            <div className="p-2 rounded-full bg-slate-800 group-hover:bg-indigo-600 transition-colors"><ArrowLeft className="w-4 h-4" /></div>
                            <span className="font-bold">Back to Overview</span>
                        </button>
                        <DashboardStats title="User Analytics" stats={userStatsMap[selectedUserId]} revenueShare={allUsers.find(u=>u.id===selectedUserId)?.revenueShare} showShareInfo={true} />
                    </div>
                )}
                {activeTab === 'users' && <AdminUserManagement users={allUsers} onAddUser={handleAddUser as any} onUpdateUser={handleUpdateUser} onDeleteUser={handleDeleteUser} onExportData={handleExport} onViewStats={(id) => { setSelectedUserId(id); setActiveTab('dashboard'); }} />}
                {activeTab === 'music' && <MusicLibrary tracks={musicList} role={UserRole.ADMIN} onAddTrack={handleAddTrack} onDeleteTrack={handleDeleteTrack} allUsers={allUsers} />}
                {activeTab === 'data' && <AdminDataUpload onDataParsed={handleDataParsed} users={allUsers} />}
            </>
        )}

        {/* User Views */}
        {currentUser.role === UserRole.USER && activeTab !== 'channel_detail' && (
            <>
                {activeTab === 'dashboard' && (
                    <DashboardStats 
                        title="My Total Performance" 
                        stats={userStatsMap[currentUser.id]} 
                        revenueShare={currentUser.revenueShare} 
                        showShareInfo={false} // HIDE SHARE PERCENTAGE
                    />
                )}
                {activeTab === 'my-music' && <MusicLibrary tracks={musicList.filter(m => m.assignedToIds.includes('all') || m.assignedToIds.includes(currentUser.id))} role={UserRole.USER} />}
                {activeTab === 'settings' && (
                    <UserSettings 
                        user={currentUser} 
                        onViewChannelStats={handleViewChannelStats} 
                    />
                )}
            </>
        )}
    </Layout>
  );
}

export default App;