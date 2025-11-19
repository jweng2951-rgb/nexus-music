import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { AdminUserManagement } from './components/AdminUserManagement';
import { AdminDataUpload } from './components/AdminDataUpload';
import { DashboardStats } from './components/DashboardStats';
import { MusicLibrary } from './components/MusicLibrary';
import { UserSettings } from './components/UserSettings';
import { User, UserRole, CsvRow, ChannelStats, MusicTrack } from './types';
import { dataService } from './services/dataService';
import { ArrowRight, ArrowLeft, Sparkles, Loader2, Check, Copy } from 'lucide-react';

function App() {
  // --- 状态 ---
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [statsMap, setStatsMap] = useState<Record<string, ChannelStats>>({});
  const [musicList, setMusicList] = useState<MusicTrack[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [copyLink, setCopyLink] = useState(false);
  
  // 管理员钻取查看子账号状态
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // 登录表单状态
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // --- 副作用 ---
  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      try {
        // 确保数据库至少有管理员账号
        await dataService.initialize();
        
        // 并行获取所有数据
        const [users, music, stats] = await Promise.all([
          dataService.getUsers(),
          dataService.getMusic(),
          dataService.getStats()
        ]);
        
        setAllUsers(users);
        setMusicList(music);
        setStatsMap(stats);
      } catch (err) {
        console.error("初始化失败:", err);
      } finally {
        setIsLoading(false);
      }
    };

    initData();
  }, []);

  // --- 处理函数 ---

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // 重新获取用户以确保凭据最新
    const users = await dataService.getUsers();
    setAllUsers(users);

    const user = users.find(u => u.username === loginUsername && u.password === loginPassword);
    if (user) {
      if (user.status === 'suspended') {
        setLoginError('账号已被停用，请联系管理员。');
        return;
      }
      setCurrentUser(user);
      setActiveTab('dashboard');
      setLoginError('');
    } else {
      setLoginError('账号或密码错误');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setLoginUsername('');
    setLoginPassword('');
    setSelectedUserId(null);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopyLink(true);
    setTimeout(() => setCopyLink(false), 2000);
  };

  // 管理员: 用户管理
  const handleAddUser = async (userData: Partial<User>) => {
    const newUser: User = {
      ...userData as User,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString(),
      channelId: userData.channelId || '',
    };
    
    // 乐观更新
    setAllUsers([...allUsers, newUser]);
    
    // 异步保存
    await dataService.saveUser(newUser);
    // 刷新以确保一致性
    const users = await dataService.getUsers();
    setAllUsers(users);
  };

  const handleUpdateUser = async (id: string, data: Partial<User>) => {
    const existingUser = allUsers.find(u => u.id === id);
    if (!existingUser) return;

    const updatedUser = { ...existingUser, ...data };
    
    // 乐观更新
    setAllUsers(allUsers.map(u => u.id === id ? updatedUser : u));
    if (currentUser && currentUser.id === id) {
        setCurrentUser(updatedUser);
    }

    // 异步保存
    await dataService.saveUser(updatedUser);
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm('确定要删除该用户吗？此操作不可恢复。')) {
        // 乐观更新
        setAllUsers(allUsers.filter(u => u.id !== id));
        // 异步删除
        await dataService.deleteUser(id);
    }
  };

  // 音乐管理
  const handleAddTrack = async (track: MusicTrack) => {
      const newList = [...musicList, track];
      setMusicList(newList);
      await dataService.saveTrack(track);
  };

  const handleDeleteTrack = async (id: string) => {
      const newList = musicList.filter(t => t.id !== id);
      setMusicList(newList);
      await dataService.deleteTrack(id);
  };

  // 管理员: CSV 数据逻辑
  const handleDataParsed = async (rows: CsvRow[]) => {
    // 按频道 ID 分组
    interface TempStat {
        views: number;
        premiumViews: number;
        daily: Record<string, { views: number; premiumViews: number; grossRevenue: number }>;
        countries: Record<string, { views: number; grossRevenue: number }>;
    }
    
    const tempStats: Record<string, TempStat> = {};

    rows.forEach(row => {
        if (!tempStats[row.channelId]) {
            tempStats[row.channelId] = { views: 0, premiumViews: 0, daily: {}, countries: {} };
        }
        const views = parseInt(row.views.toString()) || 0;
        const premiumViews = parseInt(row.premiumViews.toString()) || 0;
        const grossRevenue = parseFloat(row.grossRevenue.toString()) || 0;
        const country = row.country || '未知';

        tempStats[row.channelId].views += views;
        tempStats[row.channelId].premiumViews += premiumViews;
        
        // 聚合每日数据
        if (!tempStats[row.channelId].daily[row.date]) {
            tempStats[row.channelId].daily[row.date] = { views: 0, premiumViews: 0, grossRevenue: 0 };
        }
        tempStats[row.channelId].daily[row.date].views += views;
        tempStats[row.channelId].daily[row.date].premiumViews += premiumViews;
        tempStats[row.channelId].daily[row.date].grossRevenue += grossRevenue;

        // 聚合国家数据
        if (!tempStats[row.channelId].countries[country]) {
            tempStats[row.channelId].countries[country] = { views: 0, grossRevenue: 0 };
        }
        tempStats[row.channelId].countries[country].views += views;
        tempStats[row.channelId].countries[country].grossRevenue += grossRevenue;
    });

    // 基于绑定的用户及其分成比例更新统计数据
    const newStatsMap = { ...statsMap };

    for (const user of allUsers) {
        if (user.channelId && tempStats[user.channelId]) {
            const rawData = tempStats[user.channelId];
            
            // 计算每日净收益
            const dailyStats = Object.entries(rawData.daily).map(([date, data]) => {
                const netRevenue = data.grossRevenue * (user.revenueShare / 100);
                return {
                    date,
                    views: data.views,
                    premiumViews: data.premiumViews,
                    estimatedRevenue: netRevenue,
                    grossRevenue: data.grossRevenue
                };
            }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

            // 计算国家统计数据 (净收益)
            const topCountries = Object.entries(rawData.countries).map(([code, data]) => ({
                code,
                views: data.views,
                revenue: data.grossRevenue * (user.revenueShare / 100)
            })).sort((a, b) => b.views - a.views);

            const totalRevenue = dailyStats.reduce((acc, curr) => acc + curr.estimatedRevenue, 0);

            const userStats: ChannelStats = {
                totalViews: rawData.views,
                totalPremiumViews: rawData.premiumViews,
                totalRevenue: totalRevenue,
                dailyStats: dailyStats,
                topCountries: topCountries,
                lastUpdated: new Date().toISOString()
            };
            
            newStatsMap[user.id] = userStats;
            // 异步保存
            await dataService.saveStats(user.id, userStats);
        }
    }

    setStatsMap(newStatsMap);
  };

  // 管理员: 导出数据
  const handleExport = (userId?: string) => {
    const dataToExport = userId ? allUsers.filter(u => u.id === userId) : allUsers;
    const csvContent = [
        ['用户ID', '用户名', '分成比例%', '频道ID', '总播放量', '会员播放量', '净收益', '状态'].join(','),
        ...dataToExport.map(u => {
            const stats = statsMap[u.id];
            return [
                u.id,
                u.username,
                u.revenueShare,
                u.channelId || '无',
                stats?.totalViews || 0,
                stats?.totalPremiumViews || 0,
                stats?.totalRevenue.toFixed(2) || 0,
                u.status === 'active' ? '正常' : '停用'
            ].join(',');
        })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Nexus数据导出_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // --- 加载界面 ---
  if (isLoading) {
    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-6">
            <div className="w-16 h-16 bg-indigo-600/20 rounded-full flex items-center justify-center relative">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                <div className="absolute inset-0 rounded-full border-t border-indigo-500 animate-ping opacity-20"></div>
            </div>
            <div className="text-center">
                <h2 className="text-xl font-bold tracking-tight">Nexus 音乐管理系统</h2>
                <p className="text-slate-500 text-sm mt-2">正在建立与云端数据库的安全连接...</p>
            </div>
        </div>
    );
  }

  // --- 渲染登录界面 ---

  if (!currentUser) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-slate-950">
        {/* 现代背景网格 */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/30 rounded-full blur-[120px] animate-pulse-slow"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-900/20 rounded-full blur-[120px] animate-pulse-slow" style={{animationDelay: '1s'}}></div>
            <div className="absolute top-[40%] left-[40%] w-[20%] h-[20%] bg-blue-600/10 rounded-full blur-[80px]"></div>
        </div>

        <div className="w-full max-w-md relative z-10 animate-fade-in">
            {/* 玻璃拟态卡片 */}
            <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-10 shadow-2xl ring-1 ring-white/5">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30 mb-6">
                        <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Nexus 音乐</h1>
                    <p className="text-slate-400 mt-2 text-sm">专业创作者管理平台</p>
                </div>
                
                {loginError && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-200 text-sm rounded-xl text-center backdrop-blur-sm">
                    {loginError}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-slate-400 uppercase ml-1">账号 (Access ID)</label>
                    <input 
                        type="text" 
                        className="w-full px-5 py-3.5 bg-slate-950/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-white placeholder-slate-600"
                        placeholder="请输入用户名"
                        value={loginUsername}
                        onChange={(e) => setLoginUsername(e.target.value)}
                    />
                    </div>
                    <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-slate-400 uppercase ml-1">密码 (Secure Key)</label>
                    <input 
                        type="password" 
                        className="w-full px-5 py-3.5 bg-slate-950/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-white placeholder-slate-600"
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                    />
                    </div>
                    <button 
                    type="submit" 
                    className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-4 px-4 rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center justify-center group transform active:scale-[0.98]"
                    >
                    <span>登录系统</span>
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>
            </div>
            
            <div className="mt-8 text-center space-y-4">
                 <p className="text-xs text-slate-500">云端数据库已连接</p>
                 <button 
                    onClick={handleCopyLink}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-white/5 hover:bg-slate-800 transition-colors text-xs text-slate-400"
                 >
                    {copyLink ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    {copyLink ? "链接已复制!" : "分享访问链接"}
                 </button>
            </div>
        </div>
      </div>
    );
  }

  return (
    <Layout 
        user={currentUser} 
        onLogout={handleLogout}
        activeTab={activeTab}
        onTabChange={(tab) => {
            setActiveTab(tab);
            if (tab !== 'dashboard') setSelectedUserId(null);
        }}
    >
      {currentUser.role === UserRole.ADMIN && (
        <>
            {activeTab === 'dashboard' && !selectedUserId && (
                <div className="space-y-8 animate-fade-in">
                     <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-white tracking-tight">全平台数据概览</h2>
                        <span className="text-xs font-mono font-semibold text-indigo-400 bg-indigo-950/30 px-3 py-1 rounded-full border border-indigo-500/20 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                            实时数据
                        </span>
                     </div>

                     <div className="bg-gradient-to-r from-indigo-900/20 to-violet-900/20 border border-indigo-500/20 rounded-2xl p-8 text-center backdrop-blur-sm relative overflow-hidden">
                        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:20px_20px]" />
                        <div className="relative z-10">
                            <p className="text-indigo-200 text-lg mb-2">请在 <button onClick={() => setActiveTab('users')} className="font-bold text-white hover:underline decoration-indigo-500 decoration-2 underline-offset-4">用户管理</button> 中选择用户以查看详细频道表现。</p>
                            <p className="text-slate-400 text-sm">当前监控 <span className="text-white font-bold">{Object.keys(statsMap).length}</span> 个活跃频道。</p>
                        </div>
                     </div>
                </div>
            )}
            {activeTab === 'dashboard' && selectedUserId && (
                <div className="space-y-6 animate-fade-in">
                    <button onClick={() => setSelectedUserId(null)} className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors group">
                        <div className="p-2 rounded-full bg-slate-800 group-hover:bg-indigo-600 transition-colors"><ArrowLeft className="w-4 h-4" /></div>
                        <span className="font-medium">返回全局概览</span>
                    </button>
                    <DashboardStats 
                        title={`数据分析: ${allUsers.find(u => u.id === selectedUserId)?.username || 'User'}`}
                        stats={statsMap[selectedUserId] || null} 
                        revenueShare={allUsers.find(u => u.id === selectedUserId)?.revenueShare}
                        showShareInfo={true}
                    />
                </div>
            )}
            {activeTab === 'users' && (
                <AdminUserManagement 
                    users={allUsers}
                    onAddUser={handleAddUser}
                    onUpdateUser={handleUpdateUser}
                    onDeleteUser={handleDeleteUser}
                    onExportData={handleExport}
                    onViewStats={(id) => { setSelectedUserId(id); setActiveTab('dashboard'); }}
                />
            )}
            {activeTab === 'music' && (
                <MusicLibrary 
                    tracks={musicList} role={UserRole.ADMIN} allUsers={allUsers}
                    onAddTrack={handleAddTrack} onDeleteTrack={handleDeleteTrack}
                />
            )}
            {activeTab === 'data' && (
                <AdminDataUpload onDataParsed={handleDataParsed} />
            )}
        </>
      )}
      {currentUser.role === UserRole.USER && (
        <>
            {activeTab === 'dashboard' && (
                <DashboardStats 
                    title="我的频道数据" 
                    stats={statsMap[currentUser.id] || null} 
                    revenueShare={currentUser.revenueShare}
                    showShareInfo={false}
                />
            )}
            {activeTab === 'my-music' && (
                <MusicLibrary 
                    tracks={musicList.filter(m => m.assignedToIds.includes('all') || m.assignedToIds.includes(currentUser.id))} 
                    role={UserRole.USER} allUsers={allUsers}
                />
            )}
            {activeTab === 'settings' && (
                <UserSettings user={currentUser} onUpdate={(data) => handleUpdateUser(currentUser.id, data)} />
            )}
        </>
      )}
    </Layout>
  );
}

export default App;