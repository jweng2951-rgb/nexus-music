import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { AdminUserManagement } from './components/AdminUserManagement';
import { AdminDataUpload } from './components/AdminDataUpload';
import { DashboardStats } from './components/DashboardStats';
import { MusicLibrary } from './components/MusicLibrary';
import { UserSettings } from './components/UserSettings';
import { User, UserRole, CsvRow, ChannelStats, MusicTrack, VideoStat } from './types';
import { dataService } from './services/dataService';
import { ArrowRight, ArrowLeft, Sparkles, Loader2, CheckCircle2, XCircle, Info, Copy, Check } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';
interface Toast { id: string; message: string; type: ToastType; }

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [musicList, setMusicList] = useState<MusicTrack[]>([]);
  const [userStatsMap, setUserStatsMap] = useState<Record<string, ChannelStats>>({});
  const [viewingChannelStats, setViewingChannelStats] = useState<ChannelStats | null>(null);
  const [viewingChannelId, setViewingChannelId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [copyLink, setCopyLink] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
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

  const handleLogout = () => { setCurrentUser(null); setLoginUsername(''); setLoginPassword(''); setSelectedUserId(null); setViewingChannelId(null); };

  const handleViewChannelStats = async (channelId: string) => {
      setIsLoading(true);
      const stats = await dataService.getChannelStats(channelId);
      setViewingChannelStats(stats);
      setViewingChannelId(channelId);
      setActiveTab('channel_detail');
      setIsLoading(false);
  };

  const handleBackFromChannel = () => { setViewingChannelId(null); setViewingChannelStats(null); setActiveTab('settings'); };

  // --- 核心解析逻辑 (复刻 Shorts.xin) ---
  const handleDataParsed = async (rows: CsvRow[]) => {
    const allChannels = await dataService.getAllChannels();
    const channelOwnerMap = new Map<string, {userId: string, share: number}>();
    
    // 建立索引：Channel ID -> User ID
    allChannels.forEach(ch => {
        const owner = allUsers.find(u => u.id === ch.userId);
        if (owner) channelOwnerMap.set(ch.channelId, { userId: owner.id, share: owner.revenueShare });
    });

    const userAggregates: Record<string, any> = {};
    const channelAggregates: Record<string, any> = {};
    let matchedRows = 0;

    rows.forEach(row => {
        const ownerInfo = channelOwnerMap.get(row.channelId);
        if (ownerInfo) {
            matchedRows++;
            const { userId, share } = ownerInfo;
            const views = Number(row.views) || 0;
            const premium = Number(row.premiumViews) || 0;
            const grossRaw = Number(row.grossRevenue) || 0;
            const netCalculated = grossRaw * (share / 100);
            const videoTitle = row.videoTitle || 'Unknown Video';

            // 用户层级聚合
            if (!userAggregates[userId]) userAggregates[userId] = { views: 0, premium: 0, gross: 0, net: 0, daily: {}, countries: {}, videos: {} };
            const uAgg = userAggregates[userId];
            uAgg.views += views; uAgg.premium += premium; uAgg.gross += grossRaw; uAgg.net += netCalculated;
            
            // 日期
            if (!uAgg.daily[row.date]) uAgg.daily[row.date] = { views: 0, premium: 0, net: 0 };
            uAgg.daily[row.date].views += views; uAgg.daily[row.date].premium += premium; uAgg.daily[row.date].net += netCalculated;
            
            // 国家
            const country = row.country || 'Unknown';
            if (!uAgg.countries[country]) uAgg.countries[country] = { views: 0, net: 0 };
            uAgg.countries[country].views += views; uAgg.countries[country].net += netCalculated;

            // 视频分析 (用于 Top Videos)
            if (!uAgg.videos[videoTitle]) uAgg.videos[videoTitle] = { views: 0, net: 0 };
            uAgg.videos[videoTitle].views += views; uAgg.videos[videoTitle].net += netCalculated;

            // 频道层级聚合
            if (!channelAggregates[row.channelId]) channelAggregates[row.channelId] = { views: 0, premium: 0, gross: 0, net: 0, daily: {}, countries: {}, videos: {} };
            const cAgg = channelAggregates[row.channelId];
            cAgg.views += views; cAgg.premium += premium; cAgg.gross += grossRaw; cAgg.net += netCalculated;
            
            if (!cAgg.daily[row.date]) cAgg.daily[row.date] = { views: 0, premium: 0, net: 0 };
            cAgg.daily[row.date].views += views; cAgg.daily[row.date].premium += premium; cAgg.daily[row.date].net += netCalculated;
            
            if (!cAgg.countries[country]) cAgg.countries[country] = { views: 0, net: 0 };
            cAgg.countries[country].views += views; cAgg.countries[country].net += netCalculated;

            if (!cAgg.videos[videoTitle]) cAgg.videos[videoTitle] = { views: 0, net: 0 };
            cAgg.videos[videoTitle].views += views; cAgg.videos[videoTitle].net += netCalculated;
        }
    });

    // 辅助函数：处理 Top 20 视频
    const processTopVideos = (videoMap: Record<string, {views: number, net: number}>): VideoStat[] => {
        return Object.entries(videoMap)
            .map(([title, d]) => ({ title, views: d.views, revenue: d.net }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 20);
    };

    // 保存频道数据
    for (const [cid, raw] of Object.entries(channelAggregates) as any[]) {
        const dailyStats = Object.entries(raw.daily).map(([date, d]: any) => ({
            date, views: d.views, premiumViews: d.premium, estimatedRevenue: d.net, grossRevenue: 0 
        })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const topCountries = Object.entries(raw.countries).map(([code, d]: any) => ({ code, views: d.views, revenue: d.net })).sort((a, b) => b.views - a.views);
        const topVideos = processTopVideos(raw.videos);

        await dataService.saveChannelStats(cid, { totalViews: raw.views, totalPremiumViews: raw.premium, totalRevenue: raw.net, dailyStats, topCountries, topVideos, lastUpdated: new Date().toISOString() });
    }

    // 保存用户数据
    const newUserStats = { ...userStatsMap };
    for (const [uid, raw] of Object.entries(userAggregates) as any[]) {
        const dailyStats = Object.entries(raw.daily).map(([date, d]: any) => ({
            date, views: d.views, premiumViews: d.premium, estimatedRevenue: d.net, grossRevenue: 0
        })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const topCountries = Object.entries(raw.countries).map(([code, d]: any) => ({ code, views: d.views, revenue: d.net })).sort((a, b) => b.views - a.views);
        const topVideos = processTopVideos(raw.videos);

        const statObj: ChannelStats = {
            totalViews: raw.views, totalPremiumViews: raw.premium, totalRevenue: raw.net,
            dailyStats, topCountries, topVideos, lastUpdated: new Date().toISOString()
        };
        await dataService.saveUserStats(uid, statObj);
        newUserStats[uid] = statObj;
    }
    setUserStatsMap(newUserStats);
    showToast(`Sync Complete! Processed ${matchedRows} rows.`, 'success');
  };

  const handleAddUser = async (user: Partial<User>) => { setIsLoading(true); await dataService.saveUser({ id: user.id || `user-${Date.now()}`, username: user.username!, password: user.password!, role: user.role || UserRole.USER, revenueShare: user.revenueShare || 70, createdAt: new Date().toISOString(), status: 'active', channelId: user.channelId, channelName: user.channelName }); setAllUsers(await dataService.getUsers()); setIsLoading(false); showToast('User created'); };
  const handleUpdateUser = async (id: string, updates: Partial<User>) => { setIsLoading(true); const user = allUsers.find(u => u.id === id); if (user) { await dataService.saveUser({ ...user, ...updates }); setAllUsers(await dataService.getUsers()); showToast('User updated'); } setIsLoading(false); };
  const handleDeleteUser = async (id: string) => { if (window.confirm('Delete user?')) { setIsLoading(true); await dataService.deleteUser(id); setAllUsers(await dataService.getUsers()); setIsLoading(false); showToast('User deleted'); } };
  const handleExport = (userId?: string) => { const content = "data:text/csv;charset=utf-8," + ['ID,Username,Role,Share,Status'].join(",") + "\n" + allUsers.map(u => [u.id, u.username, u.role, u.revenueShare + '%', u.status].join(",")).join("\n"); const link = document.createElement("a"); link.setAttribute("href", encodeURI(content)); link.setAttribute("download", "users.csv"); document.body.appendChild(link); link.click(); document.body.removeChild(link); };
  const handleAddTrack = async (track: MusicTrack) => { setIsLoading(true); await dataService.saveTrack(track); setMusicList(await dataService.getMusic()); setIsLoading(false); showToast('Track added'); };
  const handleDeleteTrack = async (id: string) => { if (window.confirm('Delete track?')) { setIsLoading(true); await dataService.deleteTrack(id); setMusicList(await dataService.getMusic()); setIsLoading(false); showToast('Track deleted'); } };

  if (isLoading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="w-8 h-8 text-indigo-600 animate-spin" /></div>;
  if (!currentUser) return (<div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-50"><div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8"><div className="text-center mb-8"><div className="w-14 h-14 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200"><Sparkles className="w-7 h-7 text-white" /></div><h1 className="text-2xl font-bold text-slate-900">Nexus Music</h1><p className="text-slate-500 mt-1">Partner Portal</p></div><form onSubmit={handleLogin} className="space-y-4"><div><label className="text-xs font-bold text-slate-500 uppercase">Access ID</label><input type="text" className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none" value={loginUsername} onChange={e=>setLoginUsername(e.target.value)} /></div><div><label className="text-xs font-bold text-slate-500 uppercase">Secure Key</label><input type="password" className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none" value={loginPassword} onChange={e=>setLoginPassword(e.target.value)} /></div><button type="submit" className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-100">Sign In</button></form>{loginError && <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm text-center font-medium">{loginError}</div>}<div className="mt-6 text-center"><button onClick={()=>{navigator.clipboard.writeText(window.location.href);setCopyLink(true);setTimeout(()=>setCopyLink(false),2000)}} className="text-xs text-slate-400 hover:text-indigo-600 flex items-center justify-center gap-1 mx-auto">{copyLink?<Check className="w-3 h-3"/>:<Copy className="w-3 h-3"/>} Copy Portal Link</button></div></div></div>);

  return (
    <Layout user={currentUser} onLogout={handleLogout} activeTab={activeTab} onTabChange={(tab) => { setActiveTab(tab); if(tab !== 'dashboard') setSelectedUserId(null); }}>
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">{toasts.map(t => (<div key={t.id} className={`toast-enter pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border bg-white ${t.type==='success'?'border-emerald-100 text-emerald-700':t.type==='error'?'border-red-100 text-red-700':'border-blue-100 text-blue-700'}`}>{t.type==='success'?<CheckCircle2 className="w-5 h-5"/>:t.type==='error'?<XCircle className="w-5 h-5"/>:<Info className="w-5 h-5"/>}<span className="font-medium">{t.message}</span></div>))}</div>
        {activeTab === 'channel_detail' && (<div className="space-y-6 animate-fade-in"><button onClick={handleBackFromChannel} className="flex items-center space-x-2 text-slate-500 hover:text-indigo-600 transition-colors group"><div className="p-2 rounded-full bg-white border border-slate-200 group-hover:border-indigo-200 transition-colors"><ArrowLeft className="w-4 h-4" /></div><span className="font-bold">Back to List</span></button><DashboardStats title={`Channel: ${viewingChannelId}`} stats={viewingChannelStats} revenueShare={currentUser.role===UserRole.ADMIN?100:currentUser.revenueShare} showShareInfo={false} /></div>)}
        {currentUser.role === UserRole.ADMIN && activeTab !== 'channel_detail' && (
            <>{activeTab === 'dashboard' && !selectedUserId && <DashboardStats title="Global Overview" stats={Object.values(userStatsMap).reduce((acc, curr) => ({ totalViews: acc.totalViews + curr.totalViews, totalPremiumViews: acc.totalPremiumViews + curr.totalPremiumViews, totalRevenue: acc.totalRevenue + curr.totalRevenue, dailyStats: [], topCountries: [], topVideos: [], lastUpdated: new Date().toISOString() }), { totalViews: 0, totalPremiumViews: 0, totalRevenue: 0, dailyStats: [], topCountries: [], topVideos: [], lastUpdated: '' })} showShareInfo={false} />}
            {activeTab === 'dashboard' && selectedUserId && <div className="space-y-6 animate-fade-in"><button onClick={() => setSelectedUserId(null)} className="flex items-center space-x-2 text-slate-500 hover:text-indigo-600"><ArrowLeft className="w-4 h-4" /><span className="font-bold">Back</span></button><DashboardStats title="User Analytics" stats={userStatsMap[selectedUserId]} revenueShare={allUsers.find(u=>u.id===selectedUserId)?.revenueShare} showShareInfo={true} /></div>}
            {activeTab === 'users' && <AdminUserManagement users={allUsers} onAddUser={handleAddUser as any} onUpdateUser={handleUpdateUser} onDeleteUser={handleDeleteUser} onExportData={handleExport} onViewStats={(id) => { setSelectedUserId(id); setActiveTab('dashboard'); }} />}
            {activeTab === 'music' && <MusicLibrary tracks={musicList} role={UserRole.ADMIN} onAddTrack={handleAddTrack} onDeleteTrack={handleDeleteTrack} allUsers={allUsers} />}
            {activeTab === 'data' && <AdminDataUpload onDataParsed={handleDataParsed} users={allUsers} />}</>
        )}
        {currentUser.role === UserRole.USER && activeTab !== 'channel_detail' && (
            <>{activeTab === 'dashboard' && <DashboardStats title="My Performance" stats={userStatsMap[currentUser.id]} revenueShare={currentUser.revenueShare} showShareInfo={false} />}
            {activeTab === 'my-music' && <MusicLibrary tracks={musicList.filter(m => m.assignedToIds.includes('all') || m.assignedToIds.includes(currentUser.id))} role={UserRole.USER} />}
            {activeTab === 'settings' && <UserSettings user={currentUser} onViewChannelStats={handleViewChannelStats} />}</>
        )}
    </Layout>
  );
}
export default App;