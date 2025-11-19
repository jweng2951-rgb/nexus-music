import React, { useState, useMemo } from 'react';
import { ChannelStats } from '../types';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { DollarSign, Eye, TrendingUp, Crown, Globe, Calendar } from 'lucide-react';

interface Props {
  title: string;
  stats: ChannelStats | null;
  revenueShare?: number;
  showShareInfo: boolean;
}

const COLORS = ['#6366f1', '#8b5cf6', '#d946ef', '#06b6d4', '#3b82f6', '#64748b'];

type DateRange = '7d' | '15d' | '90d' | 'custom';

export const DashboardStats: React.FC<Props> = ({ title, stats, revenueShare, showShareInfo }) => {
  const [range, setRange] = useState<DateRange>('7d');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // Filter Logic
  const filteredData = useMemo(() => {
      if (!stats) return [];
      
      const now = new Date();
      let startDate = new Date();

      if (range === '7d') {
          startDate.setDate(now.getDate() - 7);
      } else if (range === '15d') {
          startDate.setDate(now.getDate() - 15);
      } else if (range === '90d') {
          startDate.setDate(now.getDate() - 90);
      } else if (range === 'custom' && customStart && customEnd) {
          startDate = new Date(customStart);
          now.setTime(new Date(customEnd).getTime());
      } else if (range === 'custom') {
          // Return all if custom is selected but not filled
          return stats.dailyStats;
      }

      return stats.dailyStats.filter(d => {
          const dDate = new Date(d.date);
          return dDate >= startDate && dDate <= now;
      });
  }, [stats, range, customStart, customEnd]);

  // Chart Data Preparation
  const chartData = filteredData.map(d => ({
    name: d.date,
    views: d.views,
    premiumViews: d.premiumViews,
    revenue: d.estimatedRevenue
  }));

  const hasData = chartData.length > 0;

  // Pie Chart Data (Top Countries)
  const countryData = stats ? stats.topCountries.slice(0, 5).map(c => ({
      name: c.code,
      value: c.views
  })) : [];

  if (!stats) {
    return (
      <div className="text-center py-32 bg-slate-900/40 backdrop-blur-md rounded-3xl border border-white/5 shadow-xl">
        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10 ring-4 ring-white/5">
          <TrendingUp className="w-10 h-10 text-slate-600" />
        </div>
        <h3 className="text-xl font-bold text-white">No Data Available</h3>
        <p className="text-slate-500 mt-2">Bind a channel or wait for the next synchronization cycle.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
        {/* Header & Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
                <span className="text-xs font-medium text-slate-500">
                    Updated: {new Date(stats.lastUpdated).toLocaleString()}
                </span>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-900/50 rounded-xl border border-white/5">
                <button onClick={() => setRange('7d')} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${range === '7d' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>7 Days</button>
                <button onClick={() => setRange('15d')} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${range === '15d' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>15 Days</button>
                <button onClick={() => setRange('90d')} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${range === '90d' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>90 Days</button>
                <div className="h-4 w-px bg-white/10 mx-1"></div>
                <div className="flex items-center gap-2 px-2">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    <input 
                        type="date" 
                        className="bg-transparent text-xs text-white outline-none w-24 [&::-webkit-calendar-picker-indicator]:invert"
                        value={customStart}
                        onChange={(e) => { setCustomStart(e.target.value); setRange('custom'); }}
                    />
                    <span className="text-slate-600">-</span>
                    <input 
                        type="date" 
                        className="bg-transparent text-xs text-white outline-none w-24 [&::-webkit-calendar-picker-indicator]:invert"
                        value={customEnd}
                        onChange={(e) => { setCustomEnd(e.target.value); setRange('custom'); }}
                    />
                </div>
            </div>
        </div>

      {/* KPI Cards - Aggregated based on Filtered Data */}
      <div className={`grid grid-cols-1 md:grid-cols-${showShareInfo ? '4' : '3'} gap-6`}>
        {/* Total Views */}
        <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-white/5 shadow-lg relative overflow-hidden group hover:border-blue-500/30 transition-all duration-300">
          <div className="relative z-10 flex justify-between items-start">
            <div>
                <p className="text-sm font-medium text-slate-400">Views ({range === 'custom' ? 'Custom' : range})</p>
                <p className="text-3xl font-bold text-white mt-3">
                    {filteredData.reduce((sum, item) => sum + (item.views || 0), 0).toLocaleString()}
                </p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-500/20 text-blue-400">
                <Eye className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Premium Views */}
        <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-white/5 shadow-lg relative overflow-hidden group hover:border-amber-500/30 transition-all duration-300">
           <div className="relative z-10 flex justify-between items-start">
            <div>
                <p className="text-sm font-medium text-slate-400">Premium Views</p>
                <p className="text-3xl font-bold text-white mt-3">
                    {filteredData.reduce((sum, item) => sum + (item.premiumViews || 0), 0).toLocaleString()}
                </p>
            </div>
            <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center border border-amber-500/20 text-amber-400">
                <Crown className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-white/5 shadow-lg relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
           <div className="relative z-10 flex justify-between items-start">
            <div>
                <p className="text-sm font-medium text-slate-400">Net Revenue</p>
                <p className="text-3xl font-bold text-white mt-3">
                    ${filteredData.reduce((sum, item) => sum + (item.estimatedRevenue || 0), 0).toFixed(2)}
                </p>
            </div>
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/20 text-emerald-400">
                <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Revenue Share */}
        {showShareInfo && (
             <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-white/5 shadow-lg relative overflow-hidden group hover:border-purple-500/30 transition-all duration-300">
              <div className="relative z-10 flex justify-between items-start">
               <div>
                   <p className="text-sm font-medium text-slate-400">Creator Share</p>
                   <p className="text-3xl font-bold text-white mt-3">{revenueShare}%</p>
               </div>
               <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center border border-purple-500/20 text-purple-400">
                   <TrendingUp className="w-6 h-6" />
               </div>
             </div>
           </div>
        )}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views Area Chart */}
        <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-white/5 shadow-xl h-[420px]">
          <div className="flex justify-between items-center mb-8">
             <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-1 h-6 bg-indigo-500 rounded-full"></span>
                Traffic Trends
             </h3>
          </div>
          <ResponsiveContainer width="100%" height="85%">
            <AreaChart data={hasData ? chartData : [{name: 'No Data', views: 0, premiumViews: 0}]}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPrem" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
              <Tooltip 
                contentStyle={{backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b', color: '#fff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'}}
                itemStyle={{color: '#fff'}}
              />
              <Area type="monotone" dataKey="views" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" activeDot={{r: 6, fill: '#fff', stroke: '#6366f1'}} />
              <Area type="monotone" dataKey="premiumViews" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorPrem)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Bar Chart */}
        <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-white/5 shadow-xl h-[420px]">
          <div className="flex justify-between items-center mb-8">
             <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-1 h-6 bg-emerald-500 rounded-full"></span>
                Earnings
             </h3>
          </div>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={hasData ? chartData : [{name: 'No Data', revenue: 0}]}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
              <Tooltip 
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Net Revenue']}
                cursor={{fill: '#1e293b', opacity: 0.4}}
                contentStyle={{backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b', color: '#fff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'}}
                itemStyle={{color: '#fff'}}
              />
              <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Geographic Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-white/5 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                    <Globe className="w-5 h-5 text-indigo-400" />
                </div>
                <h3 className="text-lg font-bold text-white">Top Geographic Markets</h3>
            </div>
            <div className="overflow-hidden rounded-xl border border-white/5">
                <table className="min-w-full">
                    <thead>
                        <tr className="bg-slate-800/50 border-b border-white/5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                            <th className="px-6 py-4 text-left">Country</th>
                            <th className="px-6 py-4 text-right">Views</th>
                            <th className="px-6 py-4 text-right">Revenue</th>
                            <th className="px-6 py-4 text-right">Ratio</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 bg-slate-900/20">
                        {stats.topCountries.length === 0 && (
                            <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">No geographic data available.</td></tr>
                        )}
                        {stats.topCountries.slice(0, 5).map((country, idx) => (
                            <tr key={country.code} className="hover:bg-white/5 transition-colors group">
                                <td className="px-6 py-4 text-white font-medium">
                                    <div className="flex items-center gap-3">
                                        <span className="text-slate-600 w-4 text-sm">{idx + 1}</span>
                                        <span className="bg-slate-800 px-2.5 py-1 rounded text-xs font-mono text-slate-300 border border-white/5 shadow-sm">{country.code}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right text-slate-300">{country.views.toLocaleString()}</td>
                                <td className="px-6 py-4 text-right text-emerald-400 font-mono font-medium">${country.revenue.toFixed(2)}</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="w-24 h-1.5 bg-slate-800 rounded-full ml-auto overflow-hidden">
                                        <div 
                                            className="h-full bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
                                            style={{ width: `${stats.totalViews > 0 ? (country.views / stats.totalViews) * 100 : 0}%` }}
                                        />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
         </div>
         
         <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-white/5 shadow-xl flex flex-col">
            <h3 className="text-lg font-bold text-white mb-2">Audience Share</h3>
            <p className="text-slate-500 text-sm mb-6">Distribution by region</p>
            <div className="flex-1 min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={countryData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {countryData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip 
                            contentStyle={{backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b', color: '#fff'}}
                            itemStyle={{color: '#fff'}}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
         </div>
      </div>
    </div>
  );
};