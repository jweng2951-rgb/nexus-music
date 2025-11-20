
import React, { useState, useMemo } from 'react';
import { ChannelStats } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, Eye, TrendingUp, Crown, Globe, Calendar } from 'lucide-react';

interface Props {
  title: string;
  stats: ChannelStats | null;
  revenueShare?: number;
  showShareInfo: boolean;
}

const COLORS = ['#6366f1', '#8b5cf6', '#d946ef', '#06b6d4', '#3b82f6', '#64748b'];

export const DashboardStats: React.FC<Props> = ({ title, stats, revenueShare, showShareInfo }) => {
  if (!stats) return <div className="text-center py-32 bg-slate-900/40 border border-white/5 rounded-3xl"><TrendingUp className="w-12 h-12 text-slate-600 mx-auto mb-4" /><h3 className="text-xl font-bold text-white">No Data Available</h3><p className="text-slate-500 mt-2">Data will appear after synchronization.</p></div>;

  const chartData = stats.dailyStats.map(d => ({ name: d.date, views: d.views, premium: d.premiumViews, revenue: d.estimatedRevenue }));
  const countryData = stats.topCountries.slice(0, 5).map(c => ({ name: c.code, value: c.views }));

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center"><h2 className="text-2xl font-bold text-white">{title}</h2><span className="text-xs text-slate-500">Last Updated: {new Date(stats.lastUpdated).toLocaleDateString()}</span></div>
      
      <div className={`grid grid-cols-1 md:grid-cols-${showShareInfo ? '4' : '3'} gap-6`}>
        <div className="bg-slate-900/40 p-6 rounded-2xl border border-white/5 shadow-lg relative overflow-hidden group hover:border-blue-500/30 transition-all">
            <p className="text-sm font-medium text-slate-400">Total Views</p>
            <p className="text-3xl font-bold text-white mt-2">{stats.totalViews.toLocaleString()}</p>
            <div className="absolute top-4 right-4 p-2 bg-blue-500/10 rounded-lg text-blue-400"><Eye className="w-6 h-6" /></div>
        </div>
        <div className="bg-slate-900/40 p-6 rounded-2xl border border-white/5 shadow-lg relative overflow-hidden group hover:border-amber-500/30 transition-all">
            <p className="text-sm font-medium text-slate-400">Premium Views</p>
            <p className="text-3xl font-bold text-white mt-2">{stats.totalPremiumViews.toLocaleString()}</p>
            <div className="absolute top-4 right-4 p-2 bg-amber-500/10 rounded-lg text-amber-400"><Crown className="w-6 h-6" /></div>
        </div>
        <div className="bg-slate-900/40 p-6 rounded-2xl border border-white/5 shadow-lg relative overflow-hidden group hover:border-emerald-500/30 transition-all">
            <p className="text-sm font-medium text-slate-400">Net Revenue</p>
            <p className="text-3xl font-bold text-white mt-2">${stats.totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
            <div className="absolute top-4 right-4 p-2 bg-emerald-500/10 rounded-lg text-emerald-400"><DollarSign className="w-6 h-6" /></div>
        </div>
        {showShareInfo && (
            <div className="bg-slate-900/40 p-6 rounded-2xl border border-white/5 shadow-lg relative overflow-hidden group hover:border-purple-500/30 transition-all">
                <p className="text-sm font-medium text-slate-400">Creator Share</p>
                <p className="text-3xl font-bold text-white mt-2">{revenueShare}%</p>
                <div className="absolute top-4 right-4 p-2 bg-purple-500/10 rounded-lg text-purple-400"><TrendingUp className="w-6 h-6" /></div>
            </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/40 p-6 rounded-2xl border border-white/5 h-[400px]">
            <h3 className="font-bold text-white mb-4">Traffic Trend</h3>
            <ResponsiveContainer width="100%" height="90%"><AreaChart data={chartData}><defs><linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/><stop offset="95%" stopColor="#6366f1" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} /><XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} /><YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} /><Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff'}} /><Area type="monotone" dataKey="views" stroke="#6366f1" fillOpacity={1} fill="url(#colorViews)" /></AreaChart></ResponsiveContainer>
        </div>
        <div className="bg-slate-900/40 p-6 rounded-2xl border border-white/5 h-[400px]">
            <h3 className="font-bold text-white mb-4">Net Earnings</h3>
            <ResponsiveContainer width="100%" height="90%"><BarChart data={chartData}><CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} /><XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} /><YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} /><Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff'}} cursor={{fill: '#1e293b'}} /><Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900/40 p-6 rounded-2xl border border-white/5">
              <h3 className="font-bold text-white mb-4">Top Geographic Markets</h3>
              <div className="overflow-hidden rounded-xl border border-white/5">
                  <table className="w-full text-sm text-left text-slate-300">
                      <thead className="bg-slate-800 text-slate-500 font-medium uppercase text-xs"><tr><th className="px-4 py-3">Country</th><th className="px-4 py-3 text-right">Views</th><th className="px-4 py-3 text-right">Net Revenue</th></tr></thead>
                      <tbody className="divide-y divide-white/5">{stats.topCountries.slice(0, 5).map(c => (<tr key={c.code} className="hover:bg-white/5"><td className="px-4 py-3 font-mono">{c.code}</td><td className="px-4 py-3 text-right">{c.views.toLocaleString()}</td><td className="px-4 py-3 text-right text-emerald-400">${c.revenue.toFixed(2)}</td></tr>))}</tbody>
                  </table>
              </div>
          </div>
          <div className="bg-slate-900/40 p-6 rounded-2xl border border-white/5">
              <h3 className="font-bold text-white mb-4">Regional Share</h3>
              <ResponsiveContainer width="100%" height={200}><PieChart><Pie data={countryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">{countryData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}</Pie><Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff'}} /></PieChart></ResponsiveContainer>
          </div>
      </div>
    </div>
  );
};
