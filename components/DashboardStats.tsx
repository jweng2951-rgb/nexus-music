import React, { useState, useMemo } from 'react';
import { ChannelStats } from '../types';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area } from 'recharts';
import { TrendingUp, Eye, Crown, DollarSign } from 'lucide-react';

interface Props {
  title: string;
  stats: ChannelStats | null;
  revenueShare?: number;
  showShareInfo: boolean;
}

export const DashboardStats: React.FC<Props> = ({ title, stats, revenueShare }) => {
  const chartData = stats?.dailyStats.map(d => ({
      name: d.date.slice(5), // Show MM-DD
      views: d.views,
      premium: d.premiumViews,
      revenue: d.estimatedRevenue
  })) || [];

  const totalViews = stats?.totalViews || 0;
  const totalPremium = stats?.totalPremiumViews || 0;
  const totalRevenue = stats?.totalRevenue || 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 头部卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
           <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Eye className="w-6 h-6" /></div>
              <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full">+12.5%</span>
           </div>
           <p className="text-slate-500 text-sm font-medium">Total Views</p>
           <h3 className="text-3xl font-bold text-slate-800 mt-1">{totalViews.toLocaleString()}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
           <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-xl"><Crown className="w-6 h-6" /></div>
              <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full">+8.2%</span>
           </div>
           <p className="text-slate-500 text-sm font-medium">Premium Views</p>
           <h3 className="text-3xl font-bold text-slate-800 mt-1">{totalPremium.toLocaleString()}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
           <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><DollarSign className="w-6 h-6" /></div>
              <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full">+15.3%</span>
           </div>
           <p className="text-slate-500 text-sm font-medium">Estimated Revenue</p>
           <h3 className="text-3xl font-bold text-slate-800 mt-1">${totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
           {revenueShare && <p className="text-xs text-slate-400 mt-2">Based on {revenueShare}% share</p>}
        </div>
      </div>

      {/* 混合图表 (Composed Chart) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
         <div className="flex justify-between items-center mb-6">
             <h3 className="text-lg font-bold text-slate-800">Performance Trends</h3>
             <div className="flex items-center gap-4 text-xs font-medium">
                 <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-400"></span> Views</div>
                 <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-rose-500"></span> Premium</div>
                 <div className="flex items-center gap-1"><span className="w-3 h-1 bg-emerald-500"></span> Revenue</div>
             </div>
         </div>
         <div className="h-[400px] w-full">
             <ResponsiveContainer width="100%" height="100%">
                 <ComposedChart data={chartData}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                     <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                     <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} unit="$" />
                     <Tooltip contentStyle={{backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                     <Bar yAxisId="left" dataKey="views" fill="#60a5fa" radius={[4, 4, 0, 0]} barSize={20} stackId="a" />
                     <Bar yAxisId="left" dataKey="premium" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={20} stackId="a" />
                     <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={{r: 4, fill: '#fff', stroke: '#10b981', strokeWidth: 2}} />
                 </ComposedChart>
             </ResponsiveContainer>
         </div>
      </div>
    </div>
  );
};