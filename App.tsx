import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { AdminUserManagement } from './components/AdminUserManagement';
import { AdminDataUpload } from './components/AdminDataUpload';
import { DashboardStats } from './components/DashboardStats';
import { MusicLibrary } from './components/MusicLibrary';
import { UserSettings } from './components/UserSettings';
import { User, UserRole, CsvRow, ChannelStats, MusicTrack, Channel } from './types';
import { dataService } from './services/dataService';
import { Loader2, CheckCircle2, XCircle, Info, ArrowRight, Sparkles, Copy, Check } from 'lucide-react';

// Toast definition
type ToastType = 'success' | 'error' | 'info';
interface Toast { id: string; message: string; type: ToastType; }

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [statsMap, setStatsMap] = useState<Record<string, ChannelStats>>({});
  const [musicList, setMusicList] = useState<MusicTrack[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  
  // Login State
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [copyLink, setCopyLink] = useState(false);

  const showToast = (message: string, type: ToastType = 'success') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        await dataService.initialize();
        const [users, music, stats] = await Promise.all([
          dataService.getUsers(),
          dataService.getMusic(),
          dataService.getStats()
        ]);
        setAllUsers(users);
        setMusicList(music);
        setStatsMap(stats);
      } catch (e) { console.error(e); } finally { setIsLoading(false); }
    };
    init();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const users = await dataService.getUsers();
    setAllUsers(users);
    const user = users.find(u => u.username === loginUsername && u.password === loginPassword);
    if (user) {
      if (user.status === 'suspended') { setLoginError('Account suspended'); return; }
      setCurrentUser(user);
      setActiveTab('dashboard');
      setLoginError('');
      showToast('Welcome back!');
    } else { setLoginError('Invalid credentials'); }
  };

  const handleLogout = () => { setCurrentUser(null); setLoginUsername(''); setLoginPassword(''); setSelectedUserId(null); };

  // --- 核心逻辑更新：基于多频道的解析 ---
  const handleDataParsed = async (rows: CsvRow[]) => {
    // 1. 获取所有频道映射关系
    const allChannels = await dataService.getAllChannels();
    // 建立 ChannelID -> UserID 的快速查找表
    const channelOwnerMap = new Map<string, string>();
    allChannels.forEach(c => channelOwnerMap.set(c.channelId, c.userId));

    // 2. 临时统计容器
    const userAggregates: Record<string, {
        views: number; premium: number; daily: any; countries: any; gross: number
    }> = {};

    let matchedCount = 0;

    // 3. 遍历每一行 CSV
    rows.forEach(row => {
        const ownerId = channelOwnerMap.get(row.channelId);
        if (ownerId) {
            matchedCount++;
            if (!userAggregates[ownerId]) {
                userAggregates[ownerId] = { views: 0, premium: 0, daily: {}, countries: {}, gross: 0 };
            }
            
            const agg = userAggregates[ownerId];
            const v = Number(row.views) || 0;
            const p = Number(row.premiumViews) || 0;
            const g = Number(row.grossRevenue) || 0;
            
            agg.views += v;
            agg.premium += p;
            agg.gross += g; // 累加原始收益

            // 日期聚合
            if (!agg.daily[row.date]) agg.daily[row.date] = { views: 0, premium: 0, gross: 0 };
            agg.daily[row.date].views += v;
            agg.daily[row.date].premium += p;
            agg.daily[row.date].gross += g;

            // 国家聚合
            const country = row.country || 'Unknown';
            if (!agg.countries[country]) agg.countries[country] = { views: 0, gross: 0 };
            agg.countries[country].views += v;
            agg.countries[country].gross += g;
        }
    });

    // 4. 计算分成并保存
    const newStatsMap = { ...statsMap };
    for (const userId in userAggregates) {
        const user = allUsers.find(u => u.id === userId);
        if (!user) continue;

        const raw = userAggregates[userId];
        const share = user.revenueShare / 100;

        const dailyStats = Object.entries(raw.daily).map(([date, d]: any) => ({
            date, views: d.views, premiumViews: d.premium, estimatedRevenue: d.gross * share, grossRevenue: d.gross
        })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        const topCountries = Object.entries(raw.countries).map(([code, d]: any) => ({
            code, views: d.views, revenue: d.gross * share
        })).sort((a, b) => b.views - a.views);

        const finalStat: ChannelStats = {
            totalViews: raw.views,
            totalPremiumViews: raw.premium,
            totalRevenue: raw.gross * share,
            dailyStats,
            topCountries,
            lastUpdated: new Date().toISOString()
        };

        newStatsMap[userId] = finalStat;
        await dataService.saveStats(userId, finalStat);
    }

    setStatsMap(newStatsMap);
    showToast(`Sync Complete: ${matchedCount} rows matched.`);
  };

  // Loading View
  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 text-indigo-600 animate-spin" /></div>;

  // Login View
  if (!currentUser) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
              <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-10">
                  <div className="text-center mb-8">
                      <div className="inline-flex p-4 bg-indigo-50 rounded-2xl mb-4 text-indigo-600"><Sparkles className="w-8 h-8" /></div>
                      <h1 className="text-2xl font-bold text-slate-900">Nexus Music</h1>
                      <p className="text-slate-500 mt-2">Professional Partner Portal</p>
                  </div>
                  {loginError && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center mb-6 border border-red-100">{loginError}</div>}
                  <form onSubmit={handleLogin} className="space-y-4">
                      <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Access ID</label><input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all" value={loginUsername} onChange={e => setLoginUsername(e.target.value)} /></div>
                      <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Secure Key</label><input type="password" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} /></div>
                      <button type="submit" className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all flex justify-center items-center gap-2">Sign In <ArrowRight className="w-4 h-4" /></button>
                  </form>
                  <div className="mt-6 text-center"><button onClick={() => { navigator.clipboard.writeText(window.location.href); setCopyLink(true); setTimeout(() => setCopyLink(false), 2000); }} className="text-xs text-slate-400 hover:text-indigo-600 flex items-center justify-center gap-1 mx-auto">{copyLink ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} {copyLink ? 'Link Copied' : 'Share Portal Link'}</button></div>
              </div>
          </div>
      );
  }

  return (
      <Layout user={currentUser} onLogout={handleLogout} activeTab={activeTab} onTabChange={setActiveTab}>
          {/* Toasts */}
          <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
              {toasts.map(t => (
                  <div key={t.id} className={`toast-enter pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border min-w-[300px] ${t.type === 'success' ? 'bg-white border-emerald-100 text-emerald-700' : t.type === 'error' ? 'bg-white border-red-100 text-red-700' : 'bg-white border-blue-100 text-blue-700'}`}>
                      {t.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : t.type === 'error' ? <XCircle className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                      <span className="font-medium text-sm">{t.message}</span>
                  </div>
              ))}
          </div>

          {/* Admin Routes */}
          {currentUser.role === UserRole.ADMIN && (
              <>
                  {activeTab === 'dashboard' && !selectedUserId && <DashboardStats title="Global Overview" stats={Object.values(statsMap).reduce((acc, curr) => ({ totalViews: acc.totalViews + curr.totalViews, totalPremiumViews: acc.totalPremiumViews + curr.totalPremiumViews, totalRevenue: acc.totalRevenue + curr.totalRevenue, dailyStats: [], topCountries: [], lastUpdated: new Date().toISOString() }), { totalViews: 0, totalPremiumViews: 0, totalRevenue: 0, dailyStats: [], topCountries: [], lastUpdated: '' })} showShareInfo={false} />}
                  {activeTab === 'users' && <AdminUserManagement users={allUsers} onAddUser={handleAddUser} onUpdateUser={handleUpdateUser} onDeleteUser={handleDeleteUser} onExportData={handleExport} onViewStats={(id) => { setSelectedUserId(id); setActiveTab('dashboard'); }} />}
                  {activeTab === 'dashboard' && selectedUserId && <DashboardStats title={`User Analytics`} stats={statsMap[selectedUserId]} revenueShare={allUsers.find(u => u.id === selectedUserId)?.revenueShare} showShareInfo={true} />}
                  {activeTab === 'music' && <MusicLibrary tracks={musicList} role={UserRole.ADMIN} onAddTrack={handleAddTrack} onDeleteTrack={handleDeleteTrack} allUsers={allUsers} />}
                  {activeTab === 'data' && <AdminDataUpload onDataParsed={handleDataParsed} users={allUsers} />}
              </>
          )}

          {/* User Routes */}
          {currentUser.role === UserRole.USER && (
              <>
                  {activeTab === 'dashboard' && <DashboardStats title="My Performance" stats={statsMap[currentUser.id]} revenueShare={currentUser.revenueShare} showShareInfo={false} />}
                  {activeTab === 'my-music' && <MusicLibrary tracks={musicList.filter(m => m.assignedToIds.includes('all') || m.assignedToIds.includes(currentUser.id))} role={UserRole.USER} />}
                  {activeTab === 'settings' && <UserSettings user={currentUser} />}
              </>
          )}
      </Layout>
  );
}

export default App;