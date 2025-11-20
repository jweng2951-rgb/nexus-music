import React from 'react';
import { ChannelStats } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, Eye, TrendingUp, Crown } from 'lucide-react';

interface Props {
  title: string;
  stats: ChannelStats | null;
  revenueShare?: number;
  showShareInfo: boolean;
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

export const DashboardStats: React.FC<Props> = ({ title, stats, revenueShare, showShareInfo }) => {
  if (!stats) return (
    <div className="text-center py-24 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">No Data Available</h3>
        <p className="text-slate-500 mt-1">Analytics will appear after synchronization.</p>
    </div>
  );

  const chartData = stats.dailyStats.map(d => ({ name: d.date, views: d.views, premium: d.premiumViews, revenue: d.estimatedRevenue }));
  const countryData = stats.topCountries.slice(0, 5).map(c => ({ name: c.code, value: c.views }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">{title}</h2>
          <span className="text-xs text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">Last Updated: {new Date(stats.lastUpdated).toLocaleDateString()}</span>
      </div>
      
      <div className={`grid grid-cols-1 md:grid-cols-${showShareInfo ? '4' : '3'} gap-6`}>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Eye className="w-5 h-5" /></div>
            </div>
            <p className="text-sm font-medium text-slate-500">Total Views</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{stats.totalViews.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-rose-50 text-rose-600 rounded-lg"><Crown className="w-5 h-5" /></div>
            </div>
            <p className="text-sm font-medium text-slate-500">Premium Views</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{stats.totalPremiumViews.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><DollarSign className="w-5 h-5" /></div>
            </div>
            <p className="text-sm font-medium text-slate-500">Net Revenue</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">${stats.totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
        </div>
        {showShareInfo && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-violet-50 text-violet-600 rounded-lg"><TrendingUp className="w-5 h-5" /></div>
                </div>
                <p className="text-sm font-medium text-slate-500">Creator Share</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{revenueShare}%</p>
            </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-[400px]">
            <h3 className="font-bold text-slate-800 mb-6">Traffic Trend</h3>
            <ResponsiveContainer width="100%" height="85%"><AreaChart data={chartData}><defs><linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} /><XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} /><YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} /><Tooltip contentStyle={{backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} /><Area type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorViews)" /></AreaChart></ResponsiveContainer>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-[400px]">
            <h3 className="font-bold text-slate-800 mb-6">Net Earnings</h3>
            <ResponsiveContainer width="100%" height="85%"><BarChart data={chartData}><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} /><XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} /><YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} /><Tooltip contentStyle={{backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} cursor={{fill: '#f8fafc'}} /><Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4">Top Geographic Markets</h3>
              <div className="overflow-hidden rounded-xl border border-slate-100">
                  <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 text-slate-500 font-medium uppercase text-xs"><tr><th className="px-4 py-3">Country</th><th className="px-4 py-3 text-right">Views</th><th className="px-4 py-3 text-right">Revenue</th></tr></thead>
                      <tbody className="divide-y divide-slate-100">{stats.topCountries.slice(0, 5).map(c => (<tr key={c.code} className="hover:bg-slate-50"><td className="px-4 py-3 font-medium text-slate-700">{c.code}</td><td className="px-4 py-3 text-right text-slate-600">{c.views.toLocaleString()}</td><td className="px-4 py-3 text-right text-emerald-600 font-medium">${c.revenue.toFixed(2)}</td></tr>))}</tbody>
                  </table>
              </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4">Regional Share</h3>
              <ResponsiveContainer width="100%" height={200}><PieChart><Pie data={countryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">{countryData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}</Pie><Tooltip contentStyle={{backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '8px'}} /></PieChart></ResponsiveContainer>
          </div>
      </div>
    </div>
  );
};