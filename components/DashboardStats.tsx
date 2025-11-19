import React from 'react';
import { ChannelStats } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, Eye, TrendingUp, Crown, Globe } from 'lucide-react';

interface Props { title: string; stats: ChannelStats | null; revenueShare?: number; showShareInfo: boolean; }
const COLORS = ['#6366f1', '#8b5cf6', '#d946ef', '#06b6d4', '#3b82f6', '#64748b'];

export const DashboardStats: React.FC<Props> = ({ title, stats, revenueShare, showShareInfo }) => {
  if (!stats) return <div className="text-center py-32 bg-slate-900/40 rounded-3xl border border-white/5"><TrendingUp className="w-10 h-10 text-slate-600 mx-auto mb-4" /><h3 className="text-xl font-bold text-white">No Data Available</h3></div>;

  const chartData = stats.dailyStats.map(d => ({ name: d.date, views: d.views, premiumViews: d.premiumViews, revenue: d.estimatedRevenue }));
  const countryData = stats.topCountries.slice(0, 5).map(c => ({ name: c.code, value: c.views }));

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between"><h2 className="text-2xl font-bold text-white">{title}</h2><span className="text-xs text-slate-500 border border-white/5 px-3 py-1 rounded">Updated: {new Date(stats.lastUpdated).toLocaleDateString()}</span></div>
      <div className={`grid grid-cols-1 md:grid-cols-${showShareInfo ? '4' : '3'} gap-6`}>
        <div className="bg-slate-900/40 p-6 rounded-2xl border border-white/5"><p className="text-sm text-slate-400">Total Views</p><p className="text-3xl font-bold text-white mt-3">{stats.totalViews.toLocaleString()}</p><div className="h-1 bg-blue-500 w-3/4 mt-4 rounded"></div></div>
        <div className="bg-slate-900/40 p-6 rounded-2xl border border-white/5"><p className="text-sm text-slate-400">Premium Views</p><p className="text-3xl font-bold text-white mt-3">{stats.totalPremiumViews.toLocaleString()}</p><div className="h-1 bg-amber-500 w-1/2 mt-4 rounded"></div></div>
        <div className="bg-slate-900/40 p-6 rounded-2xl border border-white/5"><p className="text-sm text-slate-400">Net Revenue</p><p className="text-3xl font-bold text-white mt-3">${stats.totalRevenue.toFixed(2)}</p><div className="h-1 bg-emerald-500 w-full mt-4 rounded"></div></div>
        {showShareInfo && <div className="bg-slate-900/40 p-6 rounded-2xl border border-white/5"><p className="text-sm text-slate-400">Creator Share</p><p className="text-3xl font-bold text-white mt-3">{revenueShare}%</p><div className="h-1 bg-purple-500 mt-4 rounded" style={{width: `${revenueShare}%`}}></div></div>}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/40 p-6 rounded-2xl border border-white/5 h-[400px]"><h3 className="text-lg font-bold text-white mb-4">Traffic Trends</h3><ResponsiveContainer><AreaChart data={chartData}><CartesianGrid strokeDasharray="3 3" stroke="#1e293b" /><XAxis dataKey="name" /><YAxis /><Tooltip contentStyle={{backgroundColor:'#0f172a'}} /><Area type="monotone" dataKey="views" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} /><Area type="monotone" dataKey="premiumViews" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} /></AreaChart></ResponsiveContainer></div>
        <div className="bg-slate-900/40 p-6 rounded-2xl border border-white/5 h-[400px]"><h3 className="text-lg font-bold text-white mb-4">Earnings</h3><ResponsiveContainer><BarChart data={chartData}><CartesianGrid strokeDasharray="3 3" stroke="#1e293b" /><XAxis dataKey="name" /><YAxis /><Tooltip contentStyle={{backgroundColor:'#0f172a'}} /><Bar dataKey="revenue" fill="#10b981" /></BarChart></ResponsiveContainer></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2 bg-slate-900/40 p-6 rounded-2xl border border-white/5"><h3 className="text-lg font-bold text-white mb-4">Top Countries</h3>
            <table className="w-full text-sm text-slate-300"><thead><tr className="text-slate-500"><th className="text-left pb-3">Country</th><th className="text-right pb-3">Views</th><th className="text-right pb-3">Revenue</th></tr></thead><tbody>{stats.topCountries.slice(0, 5).map(c => (<tr key={c.code} className="border-t border-white/5"><td className="py-3">{c.code}</td><td className="text-right">{c.views.toLocaleString()}</td><td className="text-right text-emerald-400">${c.revenue.toFixed(2)}</td></tr>))}</tbody></table>
         </div>
         <div className="bg-slate-900/40 p-6 rounded-2xl border border-white/5"><h3 className="text-lg font-bold text-white mb-4">Region Share</h3><ResponsiveContainer height={200}><PieChart><Pie data={countryData} innerRadius={50} outerRadius={70} dataKey="value"><Cell fill="#6366f1" /></Pie><Tooltip /></PieChart></ResponsiveContainer></div>
      </div>
    </div>
  );
};