import React, { useState, useMemo } from 'react';
import { ChannelStats } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, Eye, TrendingUp, Crown, Video, Calendar, ChevronDown } from 'lucide-react';

interface Props {
  title: string;
  stats: ChannelStats | null;
  revenueShare?: number;
  showShareInfo: boolean;
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

export const DashboardStats: React.FC<Props> = ({ title, stats, revenueShare, showShareInfo }) => {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  const filteredData = useMemo(() => {
    if (!stats || !stats.dailyStats) return [];
    const now = new Date();
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : dateRange === '90d' ? 90 : 36500;
    const cutoff = new Date(now.setDate(now.getDate() - days));
    
    return stats.dailyStats.filter(d => new Date(d.date) >= cutoff);
  }, [stats, dateRange]);

  const totals = useMemo(() => {
    return filteredData.reduce((acc, curr) => ({
        views: acc.views + curr.views,
        premium: acc.premium + curr.premiumViews,
        revenue: acc.revenue + curr.estimatedRevenue
    }), { views: 0, premium: 0, revenue: 0 });
  }, [filteredData]);

  if (!stats) return (
    <div className="text-center py-24 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <TrendingUp className="w-8 h-8 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-800">No Data Available</h3>
        <p className="text-slate-500 mt-1">Analytics will appear after synchronization.</p>
    </div>
  );

  const chartData = filteredData.map(d => ({ name: d.date.slice(5), views: d.views, premium: d.premiumViews, revenue: d.estimatedRevenue }));
  const countryData = stats.topCountries.slice(0, 5).map(c => ({ name: c.code, value: c.views }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{title}</h2>
            <p className="text-sm text-slate-500 mt-1">Last Synced: {new Date(stats.lastUpdated).toLocaleDateString()}</p>
          </div>
          <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
              {(['7d', '30d', '90d', 'all'] as const).map(r => (
                  <button
                    key={r}
                    onClick={() => setDateRange(r)}
                    className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${dateRange === r ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    {r === 'all' ? 'All Time' : `Last ${r.replace('d', ' Days')}`}
                  </button>
              ))}
          </div>
      </div>
      
      <div className={`grid grid-cols-1 md:grid-cols-${showShareInfo ? '4' : '3'} gap-6`}>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <p className="text-sm font-medium text-slate-500">Total Views</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{totals.views.toLocaleString()}</p>
            <div className="mt-2 h-1 w-full bg-blue-100 rounded-full overflow-hidden"><div className="h-full bg-blue-500" style={{width: '100%'}}></div></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <p className="text-sm font-medium text-slate-500">Premium Views</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{totals.premium.toLocaleString()}</p>
            <div className="mt-2 h-1 w-full bg-rose-100 rounded-full overflow-hidden"><div className="h-full bg-rose-500" style={{width: `${(totals.premium / (totals.views || 1)) * 100}%`}}></div></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <p className="text-sm font-medium text-slate-500">Net Revenue</p>
            <p className="text-3xl font-bold text-slate-800 mt-1 text-emerald-600">${totals.revenue.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
            <div className="mt-2 h-1 w-full bg-emerald-100 rounded-full overflow-hidden"><div className="h-full bg-emerald-500" style={{width: '100%'}}></div></div>
        </div>
        {showShareInfo && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                <p className="text-sm font-medium text-slate-500">Creator Share</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{revenueShare}%</p>
                <p className="text-xs text-slate-400 mt-1">Applied to Gross Revenue</p>
            </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-[400px]">
            <h3 className="font-bold text-slate-800 mb-6">Traffic Trend</h3>
            <ResponsiveContainer width="100%" height="85%">
                <AreaChart data={chartData}>
                    <defs><linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '12px'}} />
                    <Area type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorViews)" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-[400px]">
            <h3 className="font-bold text-slate-800 mb-6">Net Revenue Trend</h3>
            <ResponsiveContainer width="100%" height="85%">
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '12px'}} cursor={{fill: '#f8fafc'}} />
                    <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Video className="w-5 h-5 text-indigo-600"/> Top Performing Videos (All Time)</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-medium uppercase text-xs"><tr><th className="px-4 py-3">Video Title</th><th className="px-4 py-3 text-right">Views</th><th className="px-4 py-3 text-right">Est. Revenue</th></tr></thead>
                        <tbody className="divide-y divide-slate-100">
                            {stats.topVideos && stats.topVideos.length > 0 ? stats.topVideos.map((v, i) => (
                                <tr key={i} className="hover:bg-slate-50"><td className="px-4 py-3 font-medium text-slate-700 truncate max-w-[250px]">{v.title}</td><td className="px-4 py-3 text-right text-slate-600">{v.views.toLocaleString()}</td><td className="px-4 py-3 text-right text-emerald-600 font-medium">${v.revenue.toFixed(2)}</td></tr>
                            )) : <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-400">No video data found.</td></tr>}
                        </tbody>
                    </table>
                  </div>
              </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-min">
              <h3 className="font-bold text-slate-800 mb-4">Regional Share</h3>
              <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                      <Pie data={countryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">{countryData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}</Pie>
                      <Tooltip contentStyle={{backgroundColor: '#fff', borderColor: '#e2e8f0'}} />
                  </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                  {countryData.slice(0, 3).map((c, i) => (
                      <div key={c.name} className="flex justify-between text-xs"><span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[i]}}></span>{c.name}</span><span className="font-bold text-slate-700">{c.value.toLocaleString()}</span></div>
                  ))}
              </div>
          </div>
      </div>
    </div>
  );
};